module.exports = object({
    id: skey(32),
    questionType: integer(),
    level: integer(),
    score: integer(),
    description: string(),
    correctAnswer: string(),
    wrongAnswerTag: string()
});