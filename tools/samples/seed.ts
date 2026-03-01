#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import type { QuestionSubcategory } from "../types";
import { disconnectRepoPrisma, persistQuestionSamples } from "../repo";
import { loadToolsEnv } from "../utils/env";

type ParsedCsvSample = {
  difficulty: string;
  prompt: string;
  options: string[];
};

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const nextChar = content[index + 1];

    if (char === "\"") {
      if (inQuotes && nextChar === "\"") {
        field += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function normalizeCell(value: string | undefined): string {
  return (value ?? "").trim();
}

function ensureSubcategoryFromFile(filePath: string): QuestionSubcategory {
  return path.basename(filePath, ".csv").toLowerCase() as QuestionSubcategory;
}

function parseCsvSamples(
  content: string,
): ParsedCsvSample[] {
  if (content.trim().length === 0) {
    return [];
  }

  const records = parseCsv(content)
    .map((record) => record.map((cell) => cell.trim()))
    .filter((record) => record.some((cell) => cell.length > 0));

  if (records.length === 0) {
    return [];
  }

  return records
    .slice(1)
    .map((record) => ({
      difficulty: normalizeCell(record[0]),
      prompt: normalizeCell(record[1]),
      options: [
        normalizeCell(record[2]),
        normalizeCell(record[3]),
        normalizeCell(record[4]),
        normalizeCell(record[5]),
      ],
    }))
    .filter((sample) => (
      sample.difficulty.length > 0 &&
      sample.prompt.length > 0 &&
      sample.options.every((option) => option.length > 0)
    ));
}

async function listCsvFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return listCsvFiles(fullPath);
    }
    if (entry.isFile() && fullPath.endsWith(".csv")) {
      return [fullPath];
    }
    return [];
  }));

  return files.flat().sort();
}

async function main(): Promise<void> {
  loadToolsEnv(import.meta.url);

  const program = new Command();
  program
    .name("question-sample-seed")
    .description("Seed QuestionSample rows from CSV files")
    .option(
      "-d, --dir <directory>",
      "CSV root directory",
      fileURLToPath(new URL("./", import.meta.url)),
    )
    .showHelpAfterError();

  await program.parseAsync(process.argv);
  const options = program.opts<{ dir: string }>();
  const csvFiles = await listCsvFiles(options.dir);

  if (csvFiles.length === 0) {
    process.stdout.write(`No CSV files found under ${options.dir}.\n`);
    return;
  }

  let totalRows = 0;
  let totalInserted = 0;
  for (const csvFile of csvFiles) {
    const subcategory = ensureSubcategoryFromFile(csvFile);
    const content = await readFile(csvFile, "utf8");
    const samples = parseCsvSamples(content);
    totalRows += samples.length;
    const insertedCount = await persistQuestionSamples({
      subcategory,
      samples: samples.map((sample) => ({
        difficulty: sample.difficulty,
        prompt: sample.prompt,
        options: sample.options.map((text) => ({ text })),
      })),
    });
    totalInserted += insertedCount;
    process.stdout.write(
      `${path.relative(process.cwd(), csvFile)}: rows=${samples.length}, inserted=${insertedCount}\n`,
    );
  }

  process.stdout.write(
    `QuestionSample seeding finished. rows=${totalRows}, inserted=${totalInserted}.\n`,
  );
}

async function run(): Promise<void> {
  try {
    await main();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  } finally {
    await disconnectRepoPrisma();
  }
}

void run();
