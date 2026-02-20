var RandomString = function(type, length) {
    var i = 0;
    this.charList = [];
    this.length = length || 4;
    type = type || '1aA';

    if (type.indexOf('i') !== -1) {
        this.charList.push('I', 'l');
    }

    if (type.indexOf('a') !== -1) {
        for (i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
            this.charList.push(String.fromCharCode(i));
        }
    }

    if (type.indexOf('A') !== -1) {
        for (i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
            this.charList.push(String.fromCharCode(i));
        }
    }

    if (type.indexOf('1') !== -1) {
        for (i = '0'.charCodeAt(0); i <= '9'.charCodeAt(0); i++) {
            this.charList.push(String.fromCharCode(i));
        }
    }

    if (!this.charList.length) {
        throw new Error("RandomString: empty charset (type=" + type + ")");
    }

    // bias 없는 샘플링을 위한 cut-off (거절 샘플링)
    // 0~255 중에서 charList.length로 나눴을 때 균일하게 떨어지는 최대 범위
    this._n = this.charList.length;
    this._max = Math.floor(256 / this._n) * this._n; // 예: n=62면 max=248
};

// 내부: CSPRNG 바이트를 채워주는 함수 (브라우저 환경)
RandomString.prototype._fillBytes = function(buf) {
    if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
        throw new Error("RandomString: crypto.getRandomValues is not available (use HTTPS or modern browser)");
    }
    crypto.getRandomValues(buf);
};

RandomString.prototype.toString = function() {
    var result = '';
    var n = this._n;
    var max = this._max;

    // 성능 위해 한 번에 여러 바이트 뽑아두고 소진
    var buf = new Uint8Array(1024);
    var idx = buf.length; // 처음엔 비어있다고 가정

    while (result.length < this.length) {
        // 버퍼 소진했으면 다시 채우기
        if (idx >= buf.length) {
            this._fillBytes(buf);
            idx = 0;
        }

        var x = buf[idx++];

        // 거절 샘플링: max 이상은 버려서 % 연산의 bias 제거
        if (x >= max) continue;

        result += this.charList[x % n];
    }

    return result;
};