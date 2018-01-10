module.exports = object({
    id: ikey(),
    title: string(),
    content: string(),
    createdTime: integer()
});