import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { getFileHandle, verifyPermission, writeResumeToDirectory, removeEntry } =
  vi.hoisted(() => ({
    getFileHandle: vi.fn(),
    verifyPermission: vi.fn(),
    writeResumeToDirectory: vi.fn(),
    removeEntry: vi.fn(),
  }));

vi.mock("@/utils/fileSystem", () => ({
  getFileHandle,
  verifyPermission,
  writeResumeToDirectory,
}));

let useResumeStore: typeof import("./useResumeStore")["useResumeStore"];
const storedValues = new Map<string, string>();

describe("resume file synchronization", () => {
  beforeAll(async () => {
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storedValues.get(key) ?? null,
      setItem: (key: string, value: string) => storedValues.set(key, value),
      removeItem: (key: string) => storedValues.delete(key),
      clear: () => storedValues.clear(),
      key: (index: number) => [...storedValues.keys()][index] ?? null,
      get length() {
        return storedValues.size;
      },
    });
    ({ useResumeStore } = await import("./useResumeStore"));
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    storedValues.clear();
    getFileHandle.mockResolvedValue({ removeEntry });
    verifyPermission.mockResolvedValue(true);
    removeEntry.mockResolvedValue(undefined);
    writeResumeToDirectory.mockResolvedValue(undefined);
    useResumeStore.setState({
      resumes: {},
      activeResumeId: null,
      activeResume: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(() => vi.unstubAllGlobals());

  it("cancels a debounced write before deleting a resume", async () => {
    const id = useResumeStore.getState().createResume(null);
    const resume = useResumeStore.getState().resumes[id];

    useResumeStore.getState().deleteResume(resume);
    await vi.runAllTimersAsync();

    expect(writeResumeToDirectory).not.toHaveBeenCalled();
    expect(removeEntry).toHaveBeenCalledWith(`${id}.json`);
  });

  it("waits for an active write before deleting its file", async () => {
    let finishWrite: (() => void) | undefined;
    writeResumeToDirectory.mockImplementation(
      () => new Promise<void>((resolve) => (finishWrite = resolve))
    );

    const id = useResumeStore.getState().createResume(null);
    const resume = useResumeStore.getState().resumes[id];
    await vi.advanceTimersByTimeAsync(300);
    expect(writeResumeToDirectory).toHaveBeenCalledOnce();

    useResumeStore.getState().deleteResume(resume);
    await Promise.resolve();
    expect(removeEntry).not.toHaveBeenCalled();

    finishWrite?.();
    await vi.runAllTimersAsync();
    expect(removeEntry).toHaveBeenCalledWith(`${id}.json`);
  });
});
