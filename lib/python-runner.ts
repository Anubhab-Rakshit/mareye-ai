import { spawn } from "child_process"

export interface PythonResult {
  stdout: string
  stderr: string
  code: number
}

export async function runPythonCommand(
  args: string[], 
  cwd: string
): Promise<PythonResult> {
  return new Promise<PythonResult>((resolve) => {
    const py = process.env.PYTHON_EXEC || (process.platform === "win32" ? "python" : "python3")
    const child = spawn(py, args, { cwd })
    
    let stdout = ""
    let stderr = ""
    
    child.stdout.on("data", (data) => {
      stdout += data.toString()
    })
    
    child.stderr.on("data", (data) => {
      stderr += data.toString()
    })
    
    child.on("close", (code) => {
      resolve({
        stdout,
        stderr,
        code: code ?? 0
      })
    })
    
    child.on("error", (error) => {
      resolve({
        stdout,
        stderr: stderr + error.message,
        code: 1
      })
    })
  })
}
