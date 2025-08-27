function parsePage() {
  // Метаданные
  const lang = document.documentElement.lang || "";
  const title = document.title.split("—")[0].trim();
  const keywords = (document.querySelector('meta[name="keywords"]')?.content || "")
    .split(",")
    .map(k => k.trim());
  const description = document.querySelector('meta[name="description"]')?.content || "";

  // OpenGraph
  const ogTags = {};
  document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
    const prop = tag.getAttribute("property").replace("og:", "");
    ogTags[prop] = tag.getAttribute("content");
  });

  // Продукт
  const productSection = document.querySelector("section.product");
  const id = productSection?.dataset.id || "";
  const isLiked = productSection?.querySelector(".like")?.classList.contains("active") || false;

  // Теги по цветам
  const tags = {
    category: [...productSection.querySelectorAll(".tags .green")].map(el => el.innerText.trim()),
    discount: [...productSection.querySelectorAll(".tags .red")].map(el => el.innerText.trim()),
    label: [...productSection.querySelectorAll(".tags .blue")].map(el => el.innerText.trim())
  };

  // Цены
  const priceBlock = productSection.querySelector(".price");
  const priceText = priceBlock?.childNodes[0]?.textContent.trim() || "";
  const oldPriceText = priceBlock?.querySelector("span")?.innerText.trim() || "";

  const parsePrice = str => parseFloat(str.replace(/[^\d.]/g, ""));
  const price = parsePrice(priceText);
  const oldPrice = parsePrice(oldPriceText);

  const discount = oldPrice - price;
  const discountPercent = oldPrice ? ((discount / oldPrice) * 100).toFixed(2) + "%" : "0%";
  const currency = priceText.includes("₽") ? "RUB" : "";

  // Свойства
  const properties = {};
  productSection.querySelectorAll(".properties li").forEach(li => {
    const spans = li.querySelectorAll("span");
    if (spans.length >= 2) {
      properties[spans[0].innerText.trim()] = spans[1].innerText.trim();
    }
  });

  // Описание
  const descriptionHTML = productSection.querySelector(".description")?.innerHTML.trim() || "";

  // Изображения
  const images = [...productSection.querySelectorAll(".preview nav img")].map(img => img.dataset.src);

  // Suggested products
  const suggested = [...document.querySelectorAll(".suggested .items article")].map(article => ({
    image: article.querySelector("img")?.src || "",
    title: article.querySelector("h3")?.innerText.trim() || "",
    price: parsePrice(article.querySelector("b")?.innerText || ""),
    currency: article.querySelector("b")?.innerText.includes("₽") ? "RUB" : "",
    description: article.querySelector("p")?.innerText.trim() || ""
  }));

  // Reviews
  const reviews = [...document.querySelectorAll(".reviews .items article")].map(article => {
    const rating = article.querySelectorAll(".rating .filled").length;
    const title = article.querySelector(".title")?.innerText.trim() || "";
    const desc = article.querySelector("p")?.innerText.trim() || "";
    const avatar = article.querySelector(".author img")?.src || "";
    const name = article.querySelector(".author span")?.innerText.trim() || "";
    const dateRaw = article.querySelector(".author i")?.innerText.trim() || "";

    const [d, m, y] = dateRaw.split("/");
    const date = `${d.padStart(2, "0")}.${m.padStart(2, "0")}.${y}`;

    return {
      rating,
      title,
      description: desc,
      author: { avatar, name },
      date
    };
  });

  return {
    meta: {
      lang,
      title,
      keywords,
      description,
      opengraph: ogTags
    },
    product: {
      id,
      isLiked,
      tags,
      price,
      oldPrice,
      discount,
      discountPercent,
      currency,
      properties,
      description: descriptionHTML,
      images
    },
    suggested,
    reviews
  };
}

window.parsePage = parsePage;
