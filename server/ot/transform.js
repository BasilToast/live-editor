function transform(o1, o2) {
    if (o1.rangeOffset > o2.rangeOffset) return o1;
    if (o1.rangeOffset === o2.rangeOffset && o1.timeStamp < o2.timeStamp)
        return o1;
    return o1;
}

module.exports = { transform };
