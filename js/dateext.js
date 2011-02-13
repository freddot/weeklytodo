
Date.prototype.offsetByWeek = function(offset) {
    this.setTime(this.getTime() + offset * (7 * 24 * 60 * 60 * 1000));
    return this;
};

Date.prototype.getWeek = function () {
    var a, b, c, d, e, f, g, n, s, w;
    
    var $y = this.getFullYear();
    var $m = this.getMonth() + 1;
    var $d = this.getDate();

    if ($m <= 2) {
        a = $y - 1;
        b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
        c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
        s = b - c;
        e = 0;
        f = $d - 1 + (31 * ($m - 1));
    } else {
        a = $y;
        b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
        c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
        s = b - c;
        e = s + 1;
        f = $d + ((153 * ($m - 3) + 2) / 5) + 58 + s;
    }
    
    g = (a + b) % 7;
    d = (f + g - e) % 7;
    n = (f + 3 - d) | 0;

    if (n < 0) {
        w = 53 - ((g - s) / 5 | 0);
    } else if (n > 364 + s) {
        w = 1;
    } else {
        w = (n / 7 | 0) + 1;
    }
    
    $y = $m = $d = null;

    return w;
};
