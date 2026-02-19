import { Comic, ComicStats } from '../types/Comic';

export const calculateComicStats = (comics: Comic[]): ComicStats => {
  const comicsWithCurrentValue = comics.filter(comic => comic.currentValue !== undefined);
  const totalPurchaseValue = comics.reduce((sum, comic) => sum + (comic.purchasePrice || 0), 0);
  const totalCurrentValue = comicsWithCurrentValue.reduce((sum, comic) => sum + (comic.currentValue || 0), 0);
  const purchaseValueOfValued = comicsWithCurrentValue.reduce((sum, comic) => sum + (comic.purchasePrice || 0), 0);
  const totalGainLoss = totalCurrentValue - purchaseValueOfValued;
  const totalGainLossPercentage = comicsWithCurrentValue.length > 0 && purchaseValueOfValued > 0
    ? (totalGainLoss / purchaseValueOfValued) * 100
    : 0;

  const findHighestValued = (subset: Comic[]): Comic | null => {
    return subset.reduce((highest, comic) => {
      const comicValue = comic.currentValue || comic.purchasePrice || 0;
      const highestValue = highest ? (highest.currentValue || highest.purchasePrice || 0) : 0;
      return comicValue > highestValue ? comic : highest;
    }, null as Comic | null);
  };

  const biggestGainer = comicsWithCurrentValue.reduce((biggest, comic) => {
    const gain = (comic.currentValue || 0) - (comic.purchasePrice || 0);
    const biggestGain = biggest ? ((biggest.currentValue || 0) - (biggest.purchasePrice || 0)) : -Infinity;
    return gain > biggestGain ? comic : biggest;
  }, null as Comic | null);

  const biggestLoser = comicsWithCurrentValue.reduce((biggest, comic) => {
    const loss = (comic.currentValue || 0) - (comic.purchasePrice || 0);
    const biggestLoss = biggest ? ((biggest.currentValue || 0) - (biggest.purchasePrice || 0)) : Infinity;
    return loss < biggestLoss ? comic : biggest;
  }, null as Comic | null);

  return {
    totalComics: comics.length,
    totalValue: totalPurchaseValue,
    totalPurchaseValue,
    totalCurrentValue,
    highestValuedComic: findHighestValued(comics),
    highestValuedSlabbedComic: findHighestValued(comics.filter(c => c.isSlabbed)),
    highestValuedRawComic: findHighestValued(comics.filter(c => !c.isSlabbed)),
    biggestGainer,
    biggestLoser,
    rawComics: comics.filter(comic => !comic.isSlabbed).length,
    slabbedComics: comics.filter(comic => comic.isSlabbed).length,
    signedComics: comics.filter(comic => comic.signedBy.trim() !== '').length,
    averageGrade: comics.length > 0
      ? comics.reduce((sum, comic) => sum + comic.grade, 0) / comics.length
      : 0,
    totalGainLoss,
    totalGainLossPercentage,
    comicsWithCurrentValue: comicsWithCurrentValue.length,
  };
};
