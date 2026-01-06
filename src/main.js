/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  const salePrice = Number(purchase.sale_price) || 0;
  const quantity = Number(purchase.quantity) || 1;
  const discount = Number(purchase.discount) || 0;
  return salePrice * quantity * (1 - discount / 100);
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  const profit = seller.profit || 0;
  if (index === 0) {
    return Math.round(profit * 0.15 * 100) / 100;
  } else if (index === 1 || index === 2) {
    return Math.round(profit * 0.1 * 100) / 100;
  } else if (index === 3) {
    return Math.round(profit * 0.05 * 100) / 100;
  }
  return 0;
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // @TODO: Проверка входных данных
  if (!data) throw new Error("No data");
  if (!Array.isArray(data.sellers) || data.sellers.length === 0)
    throw new Error("No sellers");
  if (!Array.isArray(data.products) || data.products.length === 0)
    throw new Error("No products");
  if (
    !Array.isArray(data.purchase_records) ||
    data.purchase_records.length === 0
  )
    throw new Error("No purchase_records");

  // @TODO: Проверка наличия опций
  if (
    !options ||
    typeof options.calculateRevenue !== "function" ||
    typeof options.calculateBonus !== "function"
  ) {
    throw new Error("Invalid options");
  }

  // @TODO: Подготовка промежуточных данных для сбора статистики
  // Создаем индекс продавцов для быстрого доступа и накопления статистики
  const sellersIndex = {};
  data.sellers.forEach((seller) => {
    const sellerId = seller.id;
    sellersIndex[sellerId] = {
      seller_id: sellerId,
      name: `${seller.first_name || ""} ${seller.last_name || ""}`.trim(),
      sales_count: 0,
      revenue: 0,
      profit: 0,
      bonus: 0,
      top_products: {},
    };
  });

  // @TODO: Индексация продавцов и товаров для быстрого доступа
  // Создаем индекс товаров по SKU для быстрого поиска
  const productsIndex = {};
  data.products.forEach((product) => {
    productsIndex[product.sku] = product;
  });

  // @TODO: Расчет выручки и прибыли для каждого продавца
  // Проходим по всем записям покупок
  data.purchase_records.forEach((record) => {
    const sellerId = record.seller_id;
    const seller = sellersIndex[sellerId];
    if (!seller) return; // Если продавец не найден — пропускаем

    seller.sales_count += 1; // Увеличиваем счетчик продаж

    // Проходим по всем товарам в покупке
    record.items.forEach((item) => {
      const sku = item.sku || "unknown";
      const product = productsIndex[sku] || {};
      const quantity = Number(item.quantity) || 1;

      // Рассчитываем выручку через функцию из options
      const revenue = options.calculateRevenue(item, product);
      // Себестоимость закупки товара
      const purchasePrice = Number(product.purchase_price) || 0;
      const cost = purchasePrice * quantity;
      // Прибыль с продажи
      const profit = revenue - cost;

      // Накапливаем выручку (с округлением до 2 знаков)
      seller.revenue = parseFloat((seller.revenue + revenue).toFixed(2));
      // Накапливаем прибыль
      seller.profit += profit;

      // Если SKU известен, обновляем топ-товары продавца
      if (sku !== "unknown") {
        if (!seller.top_products[sku]) {
          seller.top_products[sku] = 0;
        }
        seller.top_products[sku] += quantity;
      }
    });
  });

  // @TODO: Сортировка продавцов по прибыли
  // Преобразуем индекс в массив и сортируем по убыванию прибыли
  const sellerArray = Object.values(sellersIndex);
  sellerArray.sort((a, b) => b.profit - a.profit);

  // @TODO: Назначение премий на основе ранжирования
  // Формируем итоговый результат с расчетом бонуса
  const result = sellerArray.map((seller, index) => {
    // Рассчитываем бонус через функцию из options
    const bonus = options.calculateBonus(index, sellerArray.length, seller);

    // @TODO: Подготовка итоговой коллекции с нужными полями
    // Формируем топ-10 товаров по количеству продаж
    const topProducts = Object.entries(seller.top_products)
      .map(([sku, quantity]) => ({ sku, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return {
      seller_id: seller.seller_id,
      name: seller.name,
      revenue: seller.revenue,
      profit: Math.round(seller.profit * 100) / 100, // Округляем до 2 знаков
      sales_count: seller.sales_count,
      top_products: topProducts,
      bonus: Math.round(bonus * 100) / 100, // Округляем до 2 знаков
    };
  });

  return result;
}
