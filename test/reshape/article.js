module.exports = async (article) => {
    delete article.createdTime;
    return article;
};