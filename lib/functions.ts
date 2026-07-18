import { db, functions, type FunctionRow } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import vm from "node:vm";

const NAME = /^[a-z0-9][a-z0-9-]{0,62}$/;

export async function listFunctions(projectId: string) {
  return db
    .select({ id: functions.id, name: functions.name, updatedAt: functions.updatedAt })
    .from(functions)
    .where(eq(functions.projectId, projectId))
    .orderBy(desc(functions.updatedAt));
}

export async function getFunction(projectId: string, id: string): Promise<FunctionRow | null> {
  const [f] = await db
    .select()
    .from(functions)
    .where(and(eq(functions.id, id), eq(functions.projectId, projectId)))
    .limit(1);
  return f ?? null;
}

const DEFAULT_CODE = "// `input` is the request body, return the response.\nreturn { hello: input.name ?? \"world\" };";

export async function createFunction(projectId: string, name: string): Promise<FunctionRow> {
  const clean = name.trim().toLowerCase();
  if (!NAME.test(clean)) throw new Error("Name must be lowercase letters, numbers and hyphens.");
  const [f] = await db
    .insert(functions)
    .values({ projectId, name: clean, code: DEFAULT_CODE })
    .returning();
  return f;
}

export async function updateFunction(projectId: string, id: string, code: string): Promise<void> {
  await db
    .update(functions)
    .set({ code, updatedAt: new Date() })
    .where(and(eq(functions.id, id), eq(functions.projectId, projectId)));
}

export async function deleteFunction(projectId: string, id: string): Promise<void> {
  await db.delete(functions).where(and(eq(functions.id, id), eq(functions.projectId, projectId)));
}

export interface RunResult {
  result?: unknown;
  logs: string[];
  error?: string;
}

/** Run a function's code in a sandboxed context with a hard timeout. */
async function execute(fn: FunctionRow, input: unknown): Promise<RunResult> {
  const logs: string[] = [];
  const sandbox = {
    input,
    console: { log: (...args: unknown[]) => logs.push(args.map((a) => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ")) },
  };
  try {
    const script = new vm.Script(`(function(input){\n${fn.code}\n})(input)`);
    let result = script.runInContext(vm.createContext(sandbox), { timeout: 1000 });
    if (result && typeof (result as { then?: unknown }).then === "function") {
      result = await (result as Promise<unknown>);
    }
    return { result, logs };
  } catch (e) {
    return { error: (e as Error).message, logs };
  }
}

export async function runFunctionById(projectId: string, id: string, input: unknown): Promise<RunResult> {
  const fn = await getFunction(projectId, id);
  if (!fn) throw new Error("Function not found");
  return execute(fn, input);
}

export async function runFunctionByName(projectId: string, name: string, input: unknown): Promise<RunResult> {
  const [fn] = await db
    .select()
    .from(functions)
    .where(and(eq(functions.name, name), eq(functions.projectId, projectId)))
    .limit(1);
  if (!fn) throw new Error("Function not found");
  return execute(fn, input);
}
