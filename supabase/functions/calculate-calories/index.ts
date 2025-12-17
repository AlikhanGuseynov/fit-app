// deno-lint-ignore-file no-explicit-any
import { corsHeaders } from 'https://esm.sh/@supabase/functions-js@2.4.1'

type MealItem = {
  name: string
  calories: number
  protein?: number
  carbs?: number
  fats?: number
}

type Meal = {
  type: string
  time?: string
  items: MealItem[]
}

type CalculateBody = {
  meals: Meal[]
  calories_burned?: number
}

const summarizeMeals = (meals: Meal[]) => {
  return meals.map((meal) => {
    const totals = meal.items.reduce(
      (acc, item) => ({
        calories: acc.calories + Math.max(0, item.calories || 0),
        protein: acc.protein + (item.protein ?? 0),
        carbs: acc.carbs + (item.carbs ?? 0),
        fats: acc.fats + (item.fats ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 },
    )

    return {
      ...meal,
      totals,
    }
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = (await req.json()) as CalculateBody
    const meals = body.meals ?? []
    const burned = body.calories_burned ?? 0

    const detailed = summarizeMeals(meals)
    const totalCalories = detailed.reduce((sum, meal) => sum + meal.totals.calories, 0)

    return new Response(
      JSON.stringify({
        total_calories: totalCalories,
        calories_burned: burned,
        balance: totalCalories - burned,
        meals: detailed,
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
