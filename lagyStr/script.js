var RandomString = function(type, length) {
    var i = 0;
    this.charList = [];
    this.length = length || 4;
    type = type || '1aA';

    if(type.indexOf('i') !== -1) {
        this.charList.push('I', 'l');
    }

    if(type.indexOf('a') !== -1) {
        for (i = 'a'.charCodeAt(); i <= 'z'.charCodeAt(); i++) {
            this.charList.push(String.fromCharCode(i));
        }
    }

    if(type.indexOf('A') !== -1) {
        for (i = 'A'.charCodeAt(); i <= 'Z'.charCodeAt(); i++) {
            this.charList.push(String.fromCharCode(i));
        }
    }

    if(type.indexOf('1') !== -1) {
        for (i = '0'.charCodeAt(); i <= '9'.charCodeAt(); i++) {
            this.charList.push(String.fromCharCode(i));
        }
    }
}

RandomString.prototype.toString = function() {
    var result = '';

    for(i = 0; i < this.length; i++) {
        result += this.charList[Math.floor(Math.random() * this.charList.length)];
    }

    return result;
}