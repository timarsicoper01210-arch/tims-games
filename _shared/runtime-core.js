(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GFCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var DAY = 86400000;

  function utc(dateStr) {
    var p = dateStr.split('-').map(Number);
    return Date.UTC(p[0], p[1] - 1, p[2]);
  }

  function isArchiveLocked(gameDate, today, isPremium, freeDays) {
    if (isPremium) return false;
    return Math.round((utc(today) - utc(gameDate)) / DAY) > (freeDays === undefined ? 7 : freeDays);
  }

  function shouldShowInterstitial(completedCount, isPremium, hasAds) {
    return Boolean(hasAds) && !isPremium && completedCount > 0 && completedCount % 3 === 0;
  }

  function formatShare(o) {
    var s = Math.round(o.ms / 1000);
    var time = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    return o.title + ' — ' + o.found + '/' + o.total + ' en ' + time + ' 🔥\n' + o.url;
  }

  function hintAllowed(hintsUsed, isPremium) {
    return isPremium || hintsUsed < 1;
  }

  function needsRevalidation(validatedAt, now) {
    return validatedAt > now || now - validatedAt > 7 * DAY;
  }

  function premiumAvailable(config) {
    return Boolean(config && config.premium && config.premium.checkoutUrl);
  }

  return { premiumAvailable: premiumAvailable, isArchiveLocked: isArchiveLocked, shouldShowInterstitial: shouldShowInterstitial, formatShare: formatShare, hintAllowed: hintAllowed, needsRevalidation: needsRevalidation };
});
