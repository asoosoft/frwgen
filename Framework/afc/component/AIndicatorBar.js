/**
 * @author asoocool
 */
/*
function AIndicatorBar(imgUrl, width, height)
{
    if(!imgUrl) imgUrl = 'AFC/img/loader_small.gif';
    
    var img = $('<img src="' + imgUrl + '">');
    if(width) img.width(width);
    if(height) img.height(height);

    this.barWnd = new AWindow();
    this.barWnd.setWindowOption(
    {
        isModal : true  
    });
    
    this.barWnd.setUrl(img[0]);
}

AIndicatorBar.prototype.create = function()
{
	this.barWnd.open(null, 0, 0);
	this.barWnd.hide();
};

//중앙에 위치한다. 
AIndicatorBar.prototype.show = function(opener)
{
    if(this.barWnd.isOpen()) 
    {
		var cenX, cenY;
		if(opener)
		{
	    	cenX = opener.getWidth()/2 - this.barWnd.getWidth()/2;
	    	cenY = opener.getHeight()/2 - this.barWnd.getHeight()/2;
		}
		else
		{
	    	cenX = $(window).width()/2 - this.barWnd.getWidth()/2;
	    	cenY = $(window).height()/2 - this.barWnd.getHeight()/2;
		}
    	
        this.barWnd.move(cenX, cenY);
        //네트웍 지연이 짧을 경우는 안보여주기 위해 100 밀리세컨드의 지연을 둔다.
        this.barWnd.show(100);
    }
};

AIndicatorBar.prototype.hide = function()
{
    this.barWnd.hide();
};

AIndicatorBar.prototype.destroy = function()
{
    this.barWnd.close();
};
*/

/**
 * @author asoocool
 */
/*
function AIndicatorBar(imgUrl, width, height)
{
    var bar = null;
    if(imgUrl)
    {
        bar = $('<img src="' + imgUrl + '">');
    }
    else
    {
        //imgUrl = 'AFC/img/loader_small.gif';
        bar = $('<div id="circularG"><div id="circularG_1" class="circularG"></div><div id="circularG_2" class="circularG"></div><div id="circularG_3" class="circularG"></div>' +
                 '<div id="circularG_4" class="circularG"></div><div id="circularG_5" class="circularG"></div><div id="circularG_6" class="circularG"></div>'+
                 '<div id="circularG_7" class="circularG"></div><div id="circularG_8" class="circularG"></div></div>');
    }
    
    if(width) bar.width(width);
    if(height) bar.height(height);

    this.barWnd = new AWindow();
    this.barWnd.setWindowOption(
    {
        isModal : true,
        modalBgOption: 'dark'
    });
    
    this.barWnd.setUrl(bar[0]);
}

AIndicatorBar.prototype.create = function()
{
    this.barWnd.open(null, 0, 0);
    this.barWnd.hide();
};

//중앙에 위치한다. 
AIndicatorBar.prototype.show = function(opener)
{
    if(this.barWnd.isOpen()) 
    {
        var cenX, cenY;
        if(opener)
        {
            cenX = opener.getWidth()/2 - this.barWnd.getWidth()/2;
            cenY = opener.getHeight()/2 - this.barWnd.getHeight()/2;
        }
        else
        {
            cenX = $(window).width()/2 - this.barWnd.getWidth()/2;
            cenY = $(window).height()/2 - this.barWnd.getHeight()/2;
        }
        
        this.barWnd.move(cenX, cenY);
		
		//인디케이터는 모든 zIndex보다 높게 AToast보다는 한단계 아래에서 실행되도록 설정
		this.barWnd.modalBg.css('zIndex', 2147483645);
		this.barWnd.frame.css('zIndex', 2147483646);
		
        //네트웍 지연이 짧을 경우는 안보여주기 위해 100 밀리세컨드의 지연을 둔다.
        this.barWnd.show(100);
    }
};

AIndicatorBar.prototype.hide = function()
{
    this.barWnd.hide();
};

AIndicatorBar.prototype.destroy = function()
{
    this.barWnd.close();
};

*/


