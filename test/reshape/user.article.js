module.exports = async (userArticle) => {
    delete userArticle.modifiedTime;
    return userArticle;
};