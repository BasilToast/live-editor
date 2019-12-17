function transform(o1, o2) {
    if (o1.rangeOffset > o2.rangeOffset) return o1;
    if (o1.rangeOffset === o2.rangeOffset && o1.timeStamp < o2.timeStamp)
        return o1;
    // const deleteDelta = o2.rangeLength !== 0 ? o2.rangeLength : 0;
    // const deleteDelta = o2.rangeLength;
    // const insertDelta = o2.text.length;
    // o1.rangeOffset += insertDelta - deleteDelta;
    return o1;
}

module.exports = { transform };
