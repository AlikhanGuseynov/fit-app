// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.3'
import { corsHeaders } from 'https://esm.sh/@supabase/functions-js@2.4.1'

type OnboardingProfile = {
  user_id: string
  full_name?: string | null
  goal?: string | null
  fitness_level?: string | null
  workouts_per_week?: number | null
  equipment?: string[] | null
}

type ExerciseRecord = {
  id: string
  category: string | null
  difficulty: string | null
  equipment: string[] | null
}

type GenerateBody = {
  profile: OnboardingProfile
}

const workoutFocuses = ['full body', 'upper body', 'lower body', 'conditioning']

const chooseExercises = (exercises: ExerciseRecord[], equipment: string[] | null, focus: string) => {
  const available = equipment?.length ? equipment : null
  const filtered = exercises.filter((exercise) => {
    const matchesEquipment =
      !available || exercise.equipment?.some((item) => available.includes(item)) || exercise.equipment?.includes('bodyweight')
    if (focus === 'conditioning') {
      return matchesEquipment && (exercise.category?.includes('cardio') || exercise.category?.includes('conditioning'))
    }
    if (focus === 'upper body') {
      return matchesEquipment && exercise.category?.includes('upper')
    }
    if (focus === 'lower body') {
      return matchesEquipment && exercise.category?.includes('lower')
    }
    return matchesEquipment
  })

  if (filtered.length === 0) {
    return exercises.slice(0, 4)
  }

  return filtered.slice(0, 4)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  const client = createClient(supabaseUrl, serviceKey)

  try {
    const { profile } = (await req.json()) as GenerateBody

    if (!profile?.user_id) {
      return new Response(JSON.stringify({ error: 'user_id is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const { data: existingPlans } = await client
      .from('workout_plans')
      .select('id')
      .eq('user_id', profile.user_id)
      .eq('is_active', true)

    if (existingPlans?.length) {
      await client
        .from('workout_plans')
        .update({ is_active: false })
        .eq('user_id', profile.user_id)
        .eq('is_active', true)
    }

    const planName = profile.goal ? `План: ${profile.goal}` : 'Персональный план'

    const { data: plan, error: planError } = await client
      .from('workout_plans')
      .insert({
        user_id: profile.user_id,
        name: planName,
        goal: profile.goal ?? 'balanced',
        is_active: true,
      })
      .select('id')
      .single()

    if (planError || !plan?.id) {
      return new Response(JSON.stringify({ error: planError?.message || 'Не удалось создать план' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const { data: exercises, error: exercisesError } = await client
      .from('exercises')
      .select('id, category, difficulty, equipment')
      .limit(80)

    if (exercisesError) {
      return new Response(JSON.stringify({ error: exercisesError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const workoutsPerWeek = Math.max(1, Math.min(profile.workouts_per_week ?? 3, 7))
    const workoutsPayload = [] as Array<{ name: string; day_index: number; focus: string }>

    for (let index = 0; index < workoutsPerWeek; index += 1) {
      const focus = workoutFocuses[index % workoutFocuses.length]
      workoutsPayload.push({
        name: `Тренировка ${index + 1}`,
        day_index: index,
        focus,
      })
    }

    const { data: workouts, error: workoutsError } = await client
      .from('workouts')
      .insert(workoutsPayload.map((workout) => ({ ...workout, user_id: profile.user_id, plan_id: plan.id })))
      .select('id, name, focus')

    if (workoutsError) {
      return new Response(JSON.stringify({ error: workoutsError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const exerciseRelations = workouts.flatMap((workout) => {
      const selected = chooseExercises(exercises ?? [], profile.equipment ?? null, workout.focus ?? 'full body')
      return selected.map((exercise, idx) => ({
        user_id: profile.user_id,
        workout_id: workout.id,
        exercise_id: exercise.id,
        sets: 3,
        reps: workout.focus?.includes('conditioning') ? 12 : 10 + idx,
        rest_seconds: workout.focus?.includes('conditioning') ? 45 : 75,
        notes: workout.focus ?? null,
      }))
    })

    if (exerciseRelations.length) {
      await client.from('workout_exercises').insert(exerciseRelations)
    }

    return new Response(
      JSON.stringify({
        plan_id: plan.id,
        workouts: workouts.map((workout) => ({
          id: workout.id,
          name: workout.name,
          focus: workout.focus,
        })),
        exercises_per_workout: exerciseRelations.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
