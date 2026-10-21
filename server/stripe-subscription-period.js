function subscriptionPeriod(subscription, field, planItem) {
  const legacy = Reflect.get(subscription, field);
  if (typeof legacy === 'number') return legacy;
  const list = Reflect.get(subscription, 'items');
  const data = list && typeof list === 'object' ? Reflect.get(list, 'data') : undefined;
  const items = (Array.isArray(data) ? data : []).filter(
    (item) => typeof item === 'object' && item !== null,
  );
  const periods = new Set(items.map((item) => Reflect.get(item, field)));
  const chosen = periods.size === 1 ? items[0] : planItem?.(items);
  const value = chosen ? Reflect.get(chosen, field) : undefined;
  return typeof value === 'number' ? value : undefined;
}

export function getSubscriptionPeriodStart(subscription, planItem) {
  return subscriptionPeriod(subscription, 'current_period_start', planItem);
}

export function getSubscriptionPeriodEnd(subscription, planItem) {
  return subscriptionPeriod(subscription, 'current_period_end', planItem);
}

// The old top-level field when present (old-version payloads), otherwise the new location.
export function getInvoiceSubscription(invoice) {
  const legacy = Reflect.get(invoice, 'subscription');
  const parent = Reflect.get(invoice, 'parent');
  const details =
    parent && typeof parent === 'object' ? Reflect.get(parent, 'subscription_details') : undefined;
  const moved =
    details && typeof details === 'object' ? Reflect.get(details, 'subscription') : undefined;
  return (legacy !== undefined ? legacy : (moved ?? null));
}

// The old Price object's ID when present (old-version payloads), otherwise the price at
// pricing.price_details: an ID, or a Price when expanded.
export function getInvoicePriceId(line) {
  const legacy = Reflect.get(line, 'price');
  const pricing = legacy === undefined ? Reflect.get(line, 'pricing') : undefined;
  const details =
    pricing && typeof pricing === 'object' && Reflect.get(pricing, 'type') === 'price_details'
      ? Reflect.get(pricing, 'price_details')
      : undefined;
  const price =
    legacy !== undefined ? legacy : details && typeof details === 'object' ? Reflect.get(details, 'price') : undefined;
  const id = price && typeof price === 'object' ? Reflect.get(price, 'id') : price;
  return typeof id === 'string' ? id : undefined;
}

// The old top-level field when present (old-version payloads), otherwise
// collected_information.shipping_details, which holds only address and name.
export function getCheckoutShippingDetails(session) {
  const legacy = Reflect.get(session, 'shipping_details');
  const collected = Reflect.get(session, 'collected_information');
  const moved =
    collected && typeof collected === 'object' ? Reflect.get(collected, 'shipping_details') : undefined;
  return (legacy !== undefined ? legacy : (moved ?? null));
}
