import { faq } from "../mocks/supervisorHelp";
export async function fetchSupervisorHelp(): Promise<string[][]> {
  return structuredClone(faq);
}
