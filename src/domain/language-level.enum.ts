export enum LanguageLevel {
  /**
   * You can ask a few basic questions and ideas, but with a lot of mistakes.
   */
  Beginner = 0,

  /**
   * Limited vocabulary, but with some help you can participate in basic conversations. you still make a lot of big mistakes.
   */
  Elementary = 1,

  /**
   * Now you can converse in many situations, with less serious errors.
   */
  Intermediate = 2,

  /**
   * You're comfortable in most situations, still some good mistakes.
   */
  UpperIntermediate = 3,

  /**
   * Comfortable in most situations, strong vocabulary, few errors.
   */
  Advanced = 4,

  /**
   * You're fluent, pretty much mother tongue. Extremely comfortable, you have complete control over the language.
   */
  Proficient = 5
}

export const allowedLanguageLevels = Object.freeze(Object.values(LanguageLevel).filter(Number.isInteger)) as LanguageLevel[];
