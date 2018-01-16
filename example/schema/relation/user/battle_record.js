module.exports = object({
    subject: skey(32),
    object: skey(32),
    competitor: string(32),
    isWin: boolean(),
    myScore: integer(),
    competitorScore: integer(),
    questions: array(string(32)),
    createdTime: ikey()
});