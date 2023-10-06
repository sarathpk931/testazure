module.exports = async (targetOptions, indexHtmlContent) => {
  if (typeof indexHtmlContent === 'string') {
    indexHtmlContent = indexHtmlContent.replaceAll("type=\"module\"",
      "");
  }

  console.log("*****************");
  return indexHtmlContent;
}
