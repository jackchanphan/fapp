var _ISTEST_ = true;
var _w = window.screen.width;
var _h = window.screen.height;
var dots = [];
var pointerDot = new dot(0, 0);
var focus_x = -1,
	focus_y = -1;
var len = 220;
var threshold = 85;
var threshold2 = 120;
var threshold3 = 100;
var initFlat = true;
var gatherCnt = 0;
var MAXCON = 6;
var pointerDotMaxCon = 5 * MAXCON;
var bgTimer = null;
var itemHeight = 393;
var isGotoEnd = false;
var delayLock = false;
var currentList = '.list-new';
var itemStr = '<div class="poster"><img src="$$$$_url_$$$$"></div><div class="desc"><a href="">' + '<span class="title" title=" $$$$_title_in_$$$$ ">$$$$_title_$$$$</span><span class="price">¥$$$$_price_$$$$</span></a></div>';
var ROW_SIZE = 4;
$(function() {
	setTimeout(function() {
		_w = document.body.offsetWidth;
		initCanvas();
	}, 100);
	initLinks();
	fixLoginPos();
	initTab();
	initChannelPan();
	initGoto();
	checkGoto();
	initNav();
	window.onscroll = function(e) {
		if (!isGotoEnd && checkPos(e)) {
			if (!delayLock) {
				delayLock = true;
				setTimeout(function() {
					delayLock = false;
					loadItems(2);
				}, 500);
			}
		}
		checkGoto();
	}
	window.addEventListener('mouseout', function() {
		focus_x = -1;
		focus_y = -1;
		pointerDot.setX(focus_x);
		pointerDot.setY(focus_y);
	}, true);
	window.addEventListener('mousemove', function(e) {
		var coor = getMousePos(e);
		focus_x = coor.x;
		focus_y = coor.y;
		pointerDot.setX(focus_x);
		pointerDot.setY(focus_y);
		pointerDot.setColorStren(1.1);
		pointerDot.setMaxConnect(pointerDotMaxCon);
		if (initFlat) {
			pointerDot.nextPos = function() {};
			dots.push(pointerDot);
			len++;
			pointerDot.setID(len - 1);
			initFlat = false;
		}
	}, true);
	$(window).resize(function() {
		fixLoginPos();
		dots = [];
		pointerDot = new dot(0, 0);
		initFlat = true;
		initCanvas();
	});
});

function checkPos(e) {
	if (document.body.scrollTop >= $(document).height() - _h) {
		return true;
	} else {
		return false;
	}
}

function checkGoto() {
	if (document.body.scrollTop > 300) {
		$('.gotoTop').fadeIn(1000);
	} else {
		$('.gotoTop').fadeOut(1000).hide(10);
	}
}

function loadItems(size) {
	for (var i = 0; i < size; i++) {
		$(currentList).append('<ul><li class="item itm1 loading-img"><div class="poster">' + '<img src=""></div></li><li class="item itm2 loading-img">' + '<div class="poster"><img src=""></div></li>' + '<li class="item itm3 loading-img"><div class="poster"><img src="">' + '</div></li><li class="item itm4 loading-img"><div class="poster"><img src="">' + '</div></li></ul>');
	}
	$(currentList).css('height', itemHeight * $(currentList + ' ul').size() + 'px');
	$.ajaxSetup({
		error: function(x, e) {
			console.log(x);
			return false;
		}
	});
	$.getJSON('/data/app.json', function(o, e) {
		if (!$(currentList).data('fetchedSize')) {
			$(currentList).data('fetchedSize', 0);
		}
		var fetchedSize = $(currentList).data('fetchedSize');
		var map = o.items;
		for (var i = 0; i < size * ROW_SIZE; i++) {
			var tmpJsonObj = map['item' + fetchedSize];
			var tmp = $(currentList + ' .item:eq(' + fetchedSize + ')');
			if (tmpJsonObj) {
				tmp.find('img').fadeOut();
				tmp.find('img').get(0).onload = function() {
					$(this).fadeIn();
				}
				var tmpstr = itemStr;
				tmpstr = tmpstr.replace('$$$$_url_$$$$', tmpJsonObj.url).replace('$$$$_title_in_$$$$ ', tmpJsonObj.title).replace('$$$$_title_$$$$', tmpJsonObj.title).replace('$$$$_price_$$$$', tmpJsonObj.price);
				if (_ISTEST_) {
					(function(tmp, tmpstr) {
						setTimeout(function() {
							tmp.removeClass('loading-img');
							tmp.html(tmpstr);
						}, Math.random() * 2000);
						fetchedSize++;
					})(tmp, tmpstr);
				} else {
					tmp.removeClass('loading-img');
					tmp.html(tmpstr);
					fetchedSize++;
				}
			} else {
				tmp.remove();
				$('.loading').text('已经到世界尽头了。。。没有更多内容');
				isGotoEnd = true;
			}
			$(currentList + ' ul:empty').remove();
		}
		$(currentList).data('fetchedSize', fetchedSize);
		$(currentList).css('height', itemHeight * $(currentList + ' ul').size() + 'px');
		initLinks();
	});
}

function initLinks() {
	var a = $('a[href=""]');
	a.attr('href', 'javascript:void(0);');
}

function initNav() {
	var li = $('nav a');
	li.click(function() {
		$(this).parent().addClass('current');
		$(this).parent().siblings().removeClass('current');
	});
}

function initGoto() {
	var gotoTop = $('.gotoTop');
	gotoTop.click(function() {
		$('html,body').animate({
			scrollTop: 0
		}, 1000);
	});
}

function initChannelPan() {
	var arr = $('.channel-pan a');
	arr.attr('href', 'javascript:void(0);');
	arr.click(function() {
		if ($(this).html().length < 3) {
			$(this).parent().addClass('selected-s');
		} else {
			$(this).parent().addClass('selected-b');
		}
		$(this).parent().siblings().removeClass('selected-s');
		$(this).parent().siblings().removeClass('selected-b');
	});
}

function initTab() {
	var tabs = $('.tabs div');
	tabs.click(function() {
		$(this).toggleClass('current');
		$(this).siblings().toggleClass('current');
		$('.' + $(this).data('target')).show();
		$('.' + $(this).siblings().data('target')).hide();
		currentList = '.' + $(this).data('target');
		isGotoEnd = false;
		$('.loading').text('正在加载中。。。');
		if ($(currentList).children().size() == 0) {
			loadItems(4);
		}
	});
	tabs.eq(0).trigger('click');
}

function getMousePos(event) {
	var e = event || window.event;
	var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
	var x = e.pageX || e.clientX + scrollX;
	var y = e.clientY;
	return {
		'x': x,
		'y': y
	};
}

function fixLoginPos() {
	var loginPan = $('.login');
	var nav = $('nav');
	loginPan.css('left', nav.offset().left + nav.width() + 60 + 'px');
}

function dot(x, y) {
	var x, y, angle, id, steplen, colorstren, maxConnect, catched;
	this.x = x;
	this.y = y;
	this.angleX = Math.random() * 360 + 1;
	this.angleY = Math.random() * 360 + 1;
	this.steplen = Math.random() * 1.5 + 1;
	this.colorstren = -0.5;
	this.maxConnect = MAXCON;
	this.catchedCnt = 0;
	dot.prototype.fn = {
		getX: function() {
			return this.x;
		},
		getY: function() {
			return this.y;
		},
		getID: function() {
			return this.id;
		},
		getIndex: function() {
			return this.x * 4 + _w * 4 * this.y;
		},
		getStepLen: function() {
			return this.steplen;
		},
		getColorStren: function() {
			return this.colorstren;
		},
		getMaxConnect: function() {
			return this.maxConnect;
		},
		getCatchedCnt: function() {
			return this.catchedCnt;
		},
		setX: function(x) {
			this.x = x;
		},
		setY: function(y) {
			this.y = y;
		},
		setID: function(id) {
			this.id = id;
		},
		setStepLen: function(s) {
			this.steplen = s;
		},
		setColorStren: function(cs) {
			this.colorstren = cs;
		},
		setMaxConnect: function(mc) {
			this.maxConnect = mc;
		},
		setCatchedCnt: function(catchedCnt) {
			this.catchedCnt = catchedCnt;
		},
		nextPos: function() {
			var distance = Math.sqrt(Math.pow(focus_x - this.x, 2) + Math.pow(focus_y - this.y, 2));
			if (focus_x > 0 && distance < threshold2) {
				if (this.maxConnect < pointerDotMaxCon) {
					this.maxConnect = 5;
				}
				if (distance <= threshold3 - 15) {
					if (distance <= threshold3 - 5 && distance >= threshold3 - 17) {
						this.catched++;
					}
					if (this.catchedCnt >= 2) {
						if (this.maxConnect < pointerDotMaxCon) {
							this.maxConnect = 5;
						}
						var xflag = Math.random() > 0.5 ? 1 : -1;
						var yflag = Math.random() > 0.5 ? 1 : -1;
						this.x += xflag;
						this.y += yflag;
					} else {
						this.x += Math.round(this.steplen * Math.sin(this.angleX));
						this.y += Math.round(this.steplen * Math.sin(this.angleY));
						if (this.x >= _w || this.x < 0) {
							this.x = Math.random() * _w;
							this.steplen = Math.random() * 4 + 1;
							this.angleX = Math.random() * 360 + 1;
							this.angleY = Math.random() * 360 + 1;
						}
						if (this.y >= _h || this.y < 0) {
							this.y = Math.random() * _h;
							this.steplen = Math.random() * 4 + 1;
							this.angleX = Math.random() * 360 + 1;
							this.angleY = Math.random() * 360 + 1;
						}
					}
				} else {
					this.catched = 0;
					posx = (focus_x - this.x) / Math.abs(focus_x - this.x);
					posy = (focus_y - this.y) / Math.abs(focus_y - this.y);
					this.x += posx * Math.cos(this.angleX);
					this.y += posy * Math.sin(this.angleY);
				}
			} else {
				this.maxConnect = MAXCON;
				this.x += Math.round(this.steplen * Math.sin(this.angleX));
				this.y += Math.round(this.steplen * Math.sin(this.angleY));
				if (this.x >= _w || this.x < 0) {
					this.x = Math.random() * _w;
					this.steplen = Math.random() * 4 + 1;
					this.angleX = Math.random() * 360 + 1;
					this.angleY = Math.random() * 360 + 1;
				}
				if (this.y >= _h || this.y < 0) {
					this.y = Math.random() * _h;
					this.steplen = Math.random() * 4 + 1;
					this.angleX = Math.random() * 360 + 1;
					this.angleY = Math.random() * 360 + 1;
				}
			}
		}
	};
	(function() {
		for (var k in dot.prototype.fn) {
			dot.prototype[k] = dot.prototype.fn[k];
		}
	})();
}
var dotPairs = [];

function processDots() {
	var flag = dots.length < len;
	for (var i = 0; i < len; i++) {
		var d;
		if (flag) {
			d = new dot(Math.round(Math.random() * _w), Math.round(Math.random() * _h));
			d.setID(i);
			dots.push(d);
		} else {
			d = dots[i];
		}
		d.nextPos();
	}
	var inLen = 0;
	var map = {};
	dotPairs = new Array();
	for (var i = 0; i < len; i++) {
		if (!map[i]) {
			map[i] = 0;
		}
		for (var j = 0; j < len; j++) {
			var distance = Math.sqrt(Math.pow(dots[i].getX() - dots[j].getX(), 2) + Math.pow(dots[i].getY() - dots[j].getY(), 2));
			if (pointerDot.getID() == i) {
				if (i != j && distance < threshold3 - 1) {
					map[j] = map[j] == undefined ? 1 : map[j] + 1;
					dotPairs[inLen] = {};
					dotPairs[inLen].fx = dots[i].getX();
					dotPairs[inLen].fy = dots[i].getY();
					dotPairs[inLen].sx = dots[j].getX();
					dotPairs[inLen].sy = dots[j].getY();
					dotPairs[inLen].stren = dots[i].getColorStren();
					dotPairs[inLen].threshold = threshold3;
					dotPairs[inLen++].dis = Math.sqrt(Math.pow(dots[i].getX() - dots[j].getX(), 2) + Math.pow(dots[i].getY() - dots[j].getY(), 2))
				}
			} else {
				if (i != j && (!map[j] || map[j] < dots[j].getMaxConnect()) && distance < threshold) {
					map[j] = map[j] == undefined ? 1 : map[j] + 1;
					dotPairs[inLen] = {};
					dotPairs[inLen].fx = dots[i].getX();
					dotPairs[inLen].fy = dots[i].getY();
					dotPairs[inLen].sx = dots[j].getX();
					dotPairs[inLen].sy = dots[j].getY();
					dotPairs[inLen].stren = dots[i].getColorStren();
					dotPairs[inLen].threshold = threshold;
					dotPairs[inLen++].dis = Math.sqrt(Math.pow(dots[i].getX() - dots[j].getX(), 2) + Math.pow(dots[i].getY() - dots[j].getY(), 2))
				}
			}
		}
	}
}

function initCanvas() {
	var bgcan = $('canvas').get(0);
	_w = document.body.offsetWidth;
	bgcan.width = _w;
	bgcan.height = _h;
	var ctx = bgcan.getContext('2d');
	var dpLen = 0;
	var opacity = 0;
	clearInterval(bgTimer);
	bgTimer = setInterval(function() {
		ctx.clearRect(0, 0, _w, _h);
		processDots();
		dpLen = dotPairs.length;
		for (var i = 0; i < dpLen; i++) {
			opacity = 1 - dotPairs[i].dis / dotPairs[i].threshold + dotPairs[i].stren;
			if (opacity <= 0.1) {
				continue;
			}
			ctx.beginPath();
			ctx.moveTo(dotPairs[i].fx, dotPairs[i].fy);
			ctx.lineTo(dotPairs[i].sx, dotPairs[i].sy);
			ctx.closePath();
			ctx.strokeStyle = 'rgba(8,126,163,' + opacity + ')';
			ctx.stroke();
		}
	}, 80);
}