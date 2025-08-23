
const calculateLCS = (str1, str2) => {
    const dp = Array(str1.length + 1).fill(null).map(() => Array(str2.length + 1).fill(0));
    
    for (let i = 1; i <= str1.length; i++) {
        for (let j = 1; j <= str2.length; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[str1.length][str2.length];
};

export const calculateSimilarity = (str1, str2) => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (!s1 || !s2) return 0;
    
    // exact
    if (s1 === s2) return 100;
    
    // substring
    if (s1.includes(s2) || s2.includes(s1)) return 80;
    
    // lcs
    const lcsLength = calculateLCS(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    const lcsSimilarity = (lcsLength / maxLength) * 70;

    // word boundary matches
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    let wordBonus = 0;
    
    for (const word1 of words1) {
        for (const word2 of words2) {
            if (word1.includes(word2) || word2.includes(word1)) {
                wordBonus += 10;
            }
        }
    }
    
    // same starting characters
    let prefixBonus = 0;
    const minLength = Math.min(s1.length, s2.length);
    for (let i = 0; i < minLength; i++) {
        if (s1[i] === s2[i]) {
            prefixBonus += 0.5;
        } else {
            break;
        }
    }
    
    return Math.min(lcsSimilarity + wordBonus + prefixBonus, 95);
};


export const searchProducts = (products, searchTerm, threshold = 50) => {
    if (!searchTerm || !searchTerm.trim()) {
        return products;
    }
    
    const scoredResults = products
        .map(product => ({
            ...product,
            score: Math.max(
                calculateSimilarity(product.name || '', searchTerm),
            )
        }))
        .filter(product => product.score > threshold)
        .sort((a, b) => b.score - a.score);

    return scoredResults;
};
