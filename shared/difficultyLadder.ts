import type { SubcategoryEnum } from "@/lib/meta";

export type DifficultyProfile = {
  framework: string;
  ladder: readonly string[];
  description: DifficultyDescriptions;
};

export type DifficultyExplanation = {
  summary: string;
  details: string;
};

export type DifficultyDescriptions = Record<string, DifficultyExplanation>;

export function buildDifficultyDescriptionBlockByLadder(
  difficultyLadder: readonly string[],
  difficultyDescriptions: DifficultyDescriptions,
): string {
  return difficultyLadder
    .map((level) => {
      const explanation = difficultyDescriptions[level]!;
      return `- ${level}: ${explanation.summary} ${explanation.details}`;
    })
    .join("\n");
}

export function buildDifficultyDescriptionBlock(
  subcategory: SubcategoryEnum,
): string {
  const profile = DIFFICULTY_LADDER_BY_SUBCATEGORY[subcategory];
  return buildDifficultyDescriptionBlockByLadder(
    profile.ladder,
    profile.description,
  );
}

export const DIFFICULTY_LADDER_BY_SUBCATEGORY: Record<
  SubcategoryEnum,
  DifficultyProfile
> = {
  english: {
    framework: "CEFR",
    ladder: ["A1", "A2", "B1", "B2", "C1", "C2"],
    description: {
      A1: {
        summary: "Beginner",
        details: "Can understand and use familiar everyday expressions and very basic phrases aimed at the satisfaction of needs of a concrete type. Can introduce themselves to others and can ask and answer questions about personal details such as where they live, people they know and things they have. Can interact in a simple way provided the other person talks slowly and clearly and is prepared to help.",
      },
      A2: {
        summary: "Pre-Intermediate",
        details: "Can understand sentences and frequently used expressions related to areas of most immediate relevance (e.g. very basic personal and family information, shopping, local geography, employment). Can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar and routine matters. Can describe in simple terms aspects of their background, immediate environment and matters in areas of immediate need.",
      },
      B1: {
        summary: "Intermediate",
        details: "Can understand the main points of clear standard input on familiar matters regularly encountered in work, school, leisure, etc. Can deal with most situations likely to arise while travelling in an area where the language is spoken. Can produce simple connected text on topics that are familiar or of personal interest. Can describe experiences and events, dreams, hopes and ambitions and briefly give reasons and explanations for opinions and plans.",
      },
      B2: {
        summary: "Upper-Intermediate",
        details: "Can understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in their field of specialisation. Can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible without strain for either party. Can produce clear, detailed text on a wide range of subjects and explain a viewpoint on a topical issue giving the advantages and disadvantages of various options.",
      },
      C1: {
        summary: "Advanced",
        details: "Can understand a wide range of demanding, longer clauses and recognise implicit meaning. Can express ideas fluently and spontaneously without much obvious searching for expressions. Can use language flexibly and effectively for social, academic and professional purposes. Can produce clear, well-structured, detailed text on complex subjects, showing controlled use of organisational patterns, connectors and cohesive devices.",
      },
      C2: {
        summary: "Proficient",
        details: "Can understand with ease virtually everything heard or read. Can summarise information from different spoken and written sources, reconstructing arguments and accounts in a coherent presentation. Can express themselves spontaneously, very fluently and precisely, differentiating finer shades of meaning even in the most complex situations.",
      },
    },
  },
  japanese: {
    framework: "JLPT",
    ladder: ["N5", "N4", "N3", "N2", "N1"],
    description: {
      N5: {
        summary: "Beginner - The ability to understand some basic Japanese.",
        details: "One is able to read and understand typical expressions and sentences written in hiragana, katakana, and basic kanji. One is able to listen and comprehend conversations about topics regularly encountered in daily life and classroom situations, and is able to pick up necessary information from short conversations spoken slowly."
      },
      N4: {
        summary: "Pre-Intermediate - The ability to understand basic Japanese.",
        details: "One is able to read and understand passages on familiar daily topics written in basic vocabulary and kanji. ・One is able to listen and comprehend conversations encountered in daily life and generally follow their contents, provided that they are spoken slowly."
      },
      N3: {
        summary: "Intermediate - The ability to understand Japanese used in everyday situations to a certain degree.",
        details: "One is able to read and understand written materials with specific contents concerning everyday topics. One is also able to grasp summary information such as newspaper headlines. In addition, one is also able to read slightly difficult writings encountered in everyday situations and understand the main points of the content if some alternative phrases are available to aid one’s understanding. ・One is able to listen and comprehend coherent conversations in everyday situations, spoken at near-natural speed, and is generally able to follow their contents as well as grasp the relationships among the people involved.",
      },
      N2: {
        summary: "Advanced - The ability to understand Japanese used in everyday situations, and in a variety of circumstances to a certain degree.",
        details: "One is able to read materials written clearly on a variety of topics, such as articles and commentaries in newspapers and magazines as well as simple critiques, and comprehend their contents. One is also able to read written materials on general topics and follow their narratives as well as understand the intent of the writers. ・One is able to comprehend orally presented materials such as coherent conversations and news reports, spoken at nearly natural speed in everyday situations as well as in a variety of settings, and is able to follow their ideas and comprehend their contents. One is also able to understand the relationships among the people involved and the essential points of the presented materials.",
      },
      N1: {
        summary: "Expert - The ability to understand Japanese used in a variety of circumstances.",
        details: "One is able to read writings with logical complexity and/or abstract writings on a variety of topics, such as newspaper editorials and critiques, and comprehend both their structures and contents. One is also able to read written materials with profound contents on various topics and follow their narratives as well as understand the intent of the writers comprehensively. ・One is able to comprehend orally presented materials such as coherent conversations, news reports, and lectures, spoken at natural speed in a broad variety of settings, and is able to follow their ideas and comprehend their contents comprehensively. One is also able to understand the details of the presented materials such as the relationships among the people involved, the logical structures, and the essential points.",
      },
    },
  },
  chinese: {
    framework: "HSK",
    ladder: ["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"],
    description: {
      HSK1: {
        summary: "Beginner",
        details:
          "Can understand and use very basic Chinese words and short fixed expressions for simple daily needs.",
      },
      HSK2: {
        summary: "Elementary",
        details:
          "Can handle routine communication on familiar topics with simple sentence patterns and basic vocabulary.",
      },
      HSK3: {
        summary: "Lower-Intermediate",
        details:
          "Can communicate in common daily, study, and work situations using connected sentences and practical language.",
      },
      HSK4: {
        summary: "Intermediate",
        details:
          "Can discuss a broad range of topics with more complex grammar and can read/write medium-length texts.",
      },
      HSK5: {
        summary: "Upper-Intermediate",
        details:
          "Can understand newspapers, magazines, and longer discourse, and express ideas with nuance in writing and speech.",
      },
      HSK6: {
        summary: "Advanced",
        details:
          "Can comprehend and produce complex Chinese across academic and professional contexts with high fluency and precision.",
      },
    },
  },
} as const;
