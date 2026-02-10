export type AsyncBuffer<T> = {
  capacity: number;
  items: T[];
  isFilling: boolean;
  fillPromise: Promise<void> | null;
};

export type BufferChangeHandler<T> = (items: T[]) => void;

function cloneItems<T>(items: T[]): T[] {
  return [...items];
}

export function createAsyncBuffer<T>(capacity: number): AsyncBuffer<T> {
  if (!Number.isInteger(capacity) || capacity < 1) {
    throw new Error("Buffer capacity must be a positive integer.");
  }

  return {
    capacity,
    items: [],
    isFilling: false,
    fillPromise: null,
  };
}

export function consumeAsyncBuffer<T>(
  buffer: AsyncBuffer<T>,
  onChange?: BufferChangeHandler<T>,
): T | null {
  if (buffer.items.length === 0) {
    return null;
  }

  const nextItem = buffer.items.shift() ?? null;
  if (nextItem !== null && onChange) {
    onChange(cloneItems(buffer.items));
  }

  return nextItem;
}

export function clearAsyncBuffer<T>(
  buffer: AsyncBuffer<T>,
  onChange?: BufferChangeHandler<T>,
): void {
  if (buffer.items.length === 0) {
    return;
  }

  buffer.items = [];

  if (onChange) {
    onChange([]);
  }
}

export async function fillAsyncBuffer<T>(
  buffer: AsyncBuffer<T>,
  load: () => Promise<T>,
  onChange?: BufferChangeHandler<T>,
): Promise<void> {
  if (buffer.items.length >= buffer.capacity) {
    return;
  }

  if (buffer.fillPromise) {
    return buffer.fillPromise;
  }

  const fillTask = (async () => {
    buffer.isFilling = true;

    try {
      while (buffer.items.length < buffer.capacity) {
        const item = await load();
        buffer.items = [...buffer.items, item];

        if (onChange) {
          onChange(cloneItems(buffer.items));
        }
      }
    } finally {
      buffer.isFilling = false;
      buffer.fillPromise = null;
    }
  })();

  buffer.fillPromise = fillTask;
  return fillTask;
}
