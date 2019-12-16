function merge(op, str) {
    const str1 = str.slice(0, op.rangeOffset);
    const str2 = str.slice(op.rangeOffset + op.rangeLength);
    return `${str1}${op.text}${str2}`;
}

module.exports = { merge };
