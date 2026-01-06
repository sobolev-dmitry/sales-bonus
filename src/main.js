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

    // @TODO: Проверка наличия опций

    // @TODO: Подготовка промежуточных данных для сбора статистики

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    // @TODO: Расчет выручки и прибыли для каждого продавца

    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями
}
