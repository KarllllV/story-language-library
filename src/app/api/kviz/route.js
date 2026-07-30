import { NextResponse } from "next/server";
import { createQuizQuestions } from "../../../data/quizQuestions";

export const dynamic = "force-dynamic";

const QUESTION_COUNT = 10;

export async function GET(request) {
  const parameters = new URL(request.url).searchParams;
  const language = parameters.get("language")?.toLowerCase() ?? "en";
  const story = parameters.get("story")?.toLowerCase() ?? "rabbit";

  try {
    const quiz = createQuizQuestions({
      language,
      story,
      count: QUESTION_COUNT,
    });

    return NextResponse.json(quiz, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Kvíz se nepodařilo připravit.",
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}