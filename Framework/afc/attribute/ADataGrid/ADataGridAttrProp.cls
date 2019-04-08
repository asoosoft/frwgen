
/**
Constructor
Do not call Function in Constructor.
*/
@class ADataGridAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'ADataGrid/';

}
@extends BaseProp;


@function ADataGridAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.acc.insertItem('Option', this.attrPath+'Option.lay');

	this.insertCommonAttr();
};

@function ADataGridAttrProp:applyValueToSelComp(selComp, dataKey, valGroup, value)
{
	var prevVal;
	if(valGroup=='ATTR_VALUE')
	{
		switch(dataKey)
		{
			case 'data-pivot-grid':
			{
				if(value) 
				{
					var view = theApp.getLayoutView();
					if(view) 
					{
						var pivotGrid = new AGrid();
						pivotGrid.init();
						pivotGrid.setSgapH('15px');
						pivotGrid.posUtil.setSize('30%', 'calc(100% - 15px)');
						pivotGrid.posUtil.setStretchValue('height', '15px');

						selComp.scrlView.posUtil.setPos('left', '30%');
						selComp.scrlView.posUtil.setStretchValue('left', '30%');
						selComp.setPivotGrid(pivotGrid);
						
						//언두 히스토리에 추가하지 않으며, 컴포넌트가 추가되어도 셀렉트 타겟을 바꾸지 않기 위해
						//트리뷰에만 변경 정보를 report 한다. 
						view.getDocument().addComponent(selComp, [pivotGrid], '0px', '0px', null, false, true, [view.layTreeView], true);
					}
				}
				else
				{
					var view = theApp.getLayoutView();
					if(view) 
					{
						view.getDocument().deleteComponent([selComp.getPivotGrid()], true, true);
						
						selComp.scrlView.posUtil.setPos('left', '0px');
						selComp.scrlView.posUtil.setStretchValue('left', '0px');
					}
				}
			}
			break;

			case 'data-hide-hscrollbar':
			{
				if(value) 
				{
					selComp.scrollBarH.hide();
					
					selComp.scrlView.posUtil.setStretchValue('height', '0px');
					selComp.scrollBarV.posUtil.setStretchValue('height', '0px');
					
					var pivotGrid = selComp.getPivotGrid();
					if(pivotGrid) pivotGrid.posUtil.setStretchValue('height', '0px');
				}
				else 
				{
					selComp.scrollBarH.show();
					
					selComp.scrlView.posUtil.setStretchValue('height', '15px');
					selComp.scrollBarV.posUtil.setStretchValue('height', '15px');
					
					var pivotGrid = selComp.getPivotGrid();
					if(pivotGrid) pivotGrid.posUtil.setStretchValue('height', '15px');
				}
			}
			break;

		}
	}
	
	return @super.applyValueToSelComp(selComp, dataKey, valGroup, value);
};

