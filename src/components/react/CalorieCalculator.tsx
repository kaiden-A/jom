import {
  useEffect,
  useState,
  type SubmitEvent,
  type ReactNode,
} from "react";

const STORAGE_KEY = "jom-mula-demo-calculator";

type Sex = "female" | "male";

interface Profile {
  age: number;
  height: number;
  weight: number;
  sex: Sex;
  activity: string;
  goal: string;
}

interface Food {
  id: string;
  name: string;
  calories: number;
}

interface Stored {
  profile: Profile | null;
  foods: Food[];
}

interface FormState {
  age: string;
  height: string;
  weight: string;
  sex: Sex;
  activity: string;
  goal: string;
}

interface Target {
  bmr: number;
  tdee: number;
  target: number;
}

function activityMultiplier(level: string): number {
  if (level === "sedentary") return 1.2;
  if (level === "light") return 1.375;
  if (level === "moderate") return 1.55;
  if (level === "active") return 1.725;
  return 1.2;
}

function calculateBMR(
  weight: number,
  height: number,
  age: number,
  sex: Sex,
): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

function calculateTarget(profile: Profile): Target {
  const bmr = calculateBMR(
    profile.weight,
    profile.height,
    profile.age,
    profile.sex,
  );
  const tdee = bmr * activityMultiplier(profile.activity);

  let adjustment = 0;
  if (profile.goal === "lose") adjustment = -500;
  if (profile.goal === "gain") adjustment = 300;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target: Math.round(tdee + adjustment),
  };
}

function totalCalories(foods: Food[]): number {
  return foods.reduce((sum, food) => sum + food.calories, 0);
}

function loadState(): Stored {
  if (typeof window === "undefined") return { profile: null, foods: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { profile: null, foods: [] };
    const parsed = JSON.parse(raw) as Partial<Stored>;
    return {
      profile: parsed.profile ?? null,
      foods: Array.isArray(parsed.foods) ? parsed.foods : [],
    };
  } catch {
    return { profile: null, foods: [] };
  }
}

function format(value: number): string {
  return value.toLocaleString();
}

const defaultForm: FormState = {
  age: "25",
  height: "170",
  weight: "70",
  sex: "female",
  activity: "moderate",
  goal: "maintain",
};

export default function CalorieCalculator() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadState();
    setProfile(saved.profile);
    setFoods(saved.foods);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ profile, foods }),
      );
    } catch {
      // The demo still works without persistence.
    }
  }, [ready, profile, foods]);

  const result = profile ? calculateTarget(profile) : null;
  const eaten = totalCalories(foods);
  const left = result ? result.target - eaten : null;

  function addFood(name: string, calories: number) {
    setFoods((previous) => [
      { id: crypto.randomUUID(), name, calories },
      ...previous,
    ]);
  }

  function removeFood(id: string) {
    setFoods((previous) => previous.filter((food) => food.id !== id));
  }

  function clearFoods() {
    if (foods.length === 0) return;
    if (window.confirm("Clear the whole food log?")) {
      setFoods([]);
    }
  }

  return (
    <div className="not-prose my-8">
      <div className="clay overflow-hidden">
        <div className="bg-ink flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
          <span className="bg-mint text-ink rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase">
            Live React demo
          </span>
          <p className="text-brand-soft/60 text-xs font-bold">
            The finished calculator — components, state, and localStorage.
          </p>
        </div>

        <div className="bg-paper p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.85fr]">
            <CalculatorForm onCalculate={setProfile} />

            <aside
              className="bg-ink rounded-2xl p-5 text-white"
              aria-live="polite"
            >
              <p className="text-brand-soft text-[10px] font-bold tracking-widest uppercase">
                Your daily target
              </p>
              <p className="mt-1 text-3xl leading-none font-extrabold">
                {result ? format(result.target) : "0"}{" "}
                <span className="text-brand-soft text-sm font-bold">kcal</span>
              </p>
              <p className="text-brand-soft/60 mt-2 text-xs font-bold">
                {result
                  ? `Based on your details and ${profile?.activity} activity.`
                  : "Fill in your details and press Calculate."}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Stat label="BMR" value={result ? format(result.bmr) : "—"} />
                <Stat label="TDEE" value={result ? format(result.tdee) : "—"} />
                <Stat label="Eaten" value={format(eaten)} />
                <Stat
                  label="Left"
                  value={left === null ? "—" : format(left)}
                  danger={left !== null && left < 0}
                />
              </div>
            </aside>
          </div>

          <FoodForm onAdd={addFood} />
          <FoodLog foods={foods} onRemove={removeFood} onClear={clearFoods} />
        </div>
      </div>

      <p className="text-ink-soft mt-3 text-sm leading-relaxed font-bold">
        This is the React version, running on the page. It uses the same math
        and the same features as the vanilla app — just a different mental
        model.
      </p>
    </div>
  );
}

function CalculatorForm({
  onCalculate,
}: {
  onCalculate: (profile: Profile) => void;
}) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [error, setError] = useState("");

  function update<Key extends keyof FormState>(field: Key, value: FormState[Key]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const age = Number(form.age);
    const height = Number(form.height);
    const weight = Number(form.weight);

    if (
      !Number.isFinite(age) ||
      age < 13 ||
      age > 120 ||
      !Number.isFinite(height) ||
      height < 100 ||
      height > 250 ||
      !Number.isFinite(weight) ||
      weight < 30 ||
      weight > 300
    ) {
      setError("Please enter a valid age, height, and weight.");
      return;
    }

    setError("");
    onCalculate({
      age,
      height,
      weight,
      sex: form.sex,
      activity: form.activity,
      goal: form.goal,
    });
  }

  return (
    <section className="clay p-4 sm:p-5">
      <h2 className="font-display text-base font-semibold">Your details</h2>

      <form onSubmit={handleSubmit} className="mt-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Age">
            <input
              type="number"
              min="13"
              max="120"
              value={form.age}
              onChange={(event) => update("age", event.target.value)}
              className="border-line focus-visible:border-brand w-full rounded-xl border-2 bg-white px-3 py-2 text-sm font-semibold"
            />
          </Field>
          <Field label="Height (cm)">
            <input
              type="number"
              min="100"
              max="250"
              value={form.height}
              onChange={(event) => update("height", event.target.value)}
              className="border-line focus-visible:border-brand w-full rounded-xl border-2 bg-white px-3 py-2 text-sm font-semibold"
            />
          </Field>
          <Field label="Weight (kg)">
            <input
              type="number"
              min="30"
              max="300"
              step="0.1"
              value={form.weight}
              onChange={(event) => update("weight", event.target.value)}
              className="border-line focus-visible:border-brand w-full rounded-xl border-2 bg-white px-3 py-2 text-sm font-semibold"
            />
          </Field>
        </div>

        <fieldset className="border-line mt-3 rounded-xl border-2 px-3 py-2">
          <legend className="px-1 text-xs font-bold">Sex</legend>
          <label className="mr-4 inline-flex items-center gap-1.5 text-sm font-semibold">
            <input
              type="radio"
              name="demo-sex"
              value="female"
              checked={form.sex === "female"}
              onChange={(event) => update("sex", event.target.value as Sex)}
            />
            Female
          </label>
          <label className="inline-flex items-center gap-1.5 text-sm font-semibold">
            <input
              type="radio"
              name="demo-sex"
              value="male"
              checked={form.sex === "male"}
              onChange={(event) => update("sex", event.target.value as Sex)}
            />
            Male
          </label>
        </fieldset>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Activity">
            <select
              value={form.activity}
              onChange={(event) => update("activity", event.target.value)}
              className="border-line focus-visible:border-brand w-full rounded-xl border-2 bg-white px-3 py-2 text-sm font-semibold"
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
            </select>
          </Field>
          <Field label="Goal">
            <select
              value={form.goal}
              onChange={(event) => update("goal", event.target.value)}
              className="border-line focus-visible:border-brand w-full rounded-xl border-2 bg-white px-3 py-2 text-sm font-semibold"
            >
              <option value="maintain">Maintain</option>
              <option value="lose">Lose weight</option>
              <option value="gain">Gain weight</option>
            </select>
          </Field>
        </div>

        {error && (
          <p className="text-rose mt-2 text-xs font-bold">{error}</p>
        )}

        <button type="submit" className="btn btn-primary mt-3 text-sm">
          Calculate
        </button>
      </form>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold">{label}</span>
      {children}
    </label>
  );
}

function Stat({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white/10 p-2.5">
      <span className="text-brand-soft/60 block text-[9px] font-bold tracking-widest uppercase">
        {label}
      </span>
      <strong
        className={`mt-0.5 block text-base ${danger ? "text-rose" : "text-white"}`}
      >
        {value}
      </strong>
    </div>
  );
}

function FoodForm({ onAdd }: { onAdd: (name: string, calories: number) => void }) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(calories);

    if (!name.trim() || !Number.isFinite(value) || value < 0) return;

    onAdd(name.trim(), value);
    setName("");
    setCalories("");
  }

  return (
    <section className="clay mt-4 p-4 sm:p-5">
      <h2 className="font-display text-base font-semibold">Add food</h2>

      <form
        onSubmit={handleSubmit}
        className="mt-3 grid grid-cols-1 items-end gap-3 sm:grid-cols-[1.4fr_0.7fr_auto]"
      >
        <Field label="Food">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Chicken and rice"
            className="border-line focus-visible:border-brand w-full rounded-xl border-2 bg-white px-3 py-2 text-sm font-semibold"
          />
        </Field>
        <Field label="Calories">
          <input
            type="number"
            min="0"
            max="5000"
            value={calories}
            onChange={(event) => setCalories(event.target.value)}
            placeholder="550"
            className="border-line focus-visible:border-brand w-full rounded-xl border-2 bg-white px-3 py-2 text-sm font-semibold"
          />
        </Field>
        <button type="submit" className="btn btn-ghost text-sm">
          Add food
        </button>
      </form>
    </section>
  );
}

function FoodLog({
  foods,
  onRemove,
  onClear,
}: {
  foods: Food[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const total = totalCalories(foods);

  return (
    <section className="clay mt-4 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold">Today's food</h2>
        <span className="bg-mint/20 text-mint-deep rounded-full px-2.5 py-1 text-[10px] font-bold uppercase">
          {foods.length} {foods.length === 1 ? "item" : "items"}
        </span>
      </div>

      {foods.length === 0 ? (
        <p className="border-line text-ink-soft mt-3 rounded-xl border-2 border-dashed px-4 py-4 text-center text-sm font-bold">
          Nothing logged yet. Add your first food above.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <p className="text-ink-soft pb-2 text-xs font-bold">
            Food log for today
          </p>
          <table
            aria-label="Food log for today"
            className="w-full text-left text-sm"
          >
            <thead>
              <tr>
                <th className="border-line border-b-2 pb-2 text-xs font-bold uppercase">
                  Food
                </th>
                <th className="border-line border-b-2 pb-2 text-xs font-bold uppercase">
                  Calories
                </th>
                <th className="border-line border-b-2 pb-2 text-xs font-bold uppercase">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food) => (
                <tr key={food.id} className="border-line border-b">
                  <td className="py-2 pr-3 font-semibold">{food.name}</td>
                  <td className="py-2 pr-3 font-semibold">
                    {format(food.calories)}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onRemove(food.id)}
                      aria-label={`Remove ${food.name}`}
                      className="text-rose bg-rose/10 hover:bg-rose/20 inline-flex min-h-8 items-center rounded-full px-2.5 text-xs font-bold transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th className="pt-2 text-left text-xs font-bold uppercase">
                  Total
                </th>
                <td className="pt-2 font-extrabold">{format(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {foods.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="text-rose mt-3 text-xs font-bold underline underline-offset-2"
        >
          Clear the log
        </button>
      )}
    </section>
  );
}
