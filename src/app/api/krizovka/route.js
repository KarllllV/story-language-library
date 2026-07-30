import { NextResponse } from "next/server";
import {
  createCrosswordPuzzle,
  crosswordLanguageConfig,
  crosswordStoryConfig,
} from "../../../data/crosswordWords";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || "en";
  const story = searchParams.get("story") || "rabbit";

  if (
    !Object.hasOwn(crosswordLanguageConfig, language) ||
    !Object.hasOwn(crosswordStoryConfig, story)
  ) {
    return NextResponse.json(
      {
        error: "Vyberte platný jazyk a příběh.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const puzzle = createCrosswordPuzzle(language, story);

    return NextResponse.json(puzzle, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Crossword generation failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Křížovku se nepodařilo vytvořit.",
      },
      {
        status: 500,
      },
    );
  }
}