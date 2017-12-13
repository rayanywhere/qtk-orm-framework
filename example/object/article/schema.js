module.exports = object({
    id: string(/^.{32}$/),
    title: string(),
    content: string()
});