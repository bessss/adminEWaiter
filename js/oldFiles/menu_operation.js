function menu_operation()
{
  this.add_menuComponent = add_menuComponent;
  //Работа с изображениями
  //this.mod_src = mod_src;
  //Выбор дефолтного значения
  //this.change_menuType = change_menuType;
  Ext.onReady(function()
  {
    this.add_menuComponent();
  })
}

function add_menuComponent()
{
  Ext.getCmp('frame_center').insert( 0,Ext.getCmp('panel_menu_table') );
  Ext.getCmp('panel_menu_table').add( Ext.getCmp('menu_table') );
  Ext.getCmp('panel_menu_table').insert( 0,Ext.getCmp('menutype_lookup') );

  Ext.getCmp('menuType_table').setHeight( Ext.getCmp('frame_center').getHeight() - 26 );
  Ext.getCmp('frame_center').add(Ext.getCmp('panel_edit_menuType'));
  Ext.getCmp('panel_edit_menuType').add(Ext.getCmp('menuType_table'));

  Ext.getCmp('frame_center').add(Ext.getCmp('panel_excel'));
  Ext.getCmp('panel_excel').add(Ext.getCmp('form_menuExcel'));
}

/*function mod_src(obj)
{
  for (var i = 0; i < obj.data.items.length; ++i)
  {
    var temp = '<img src="' + obj.data.items[i].data['path'] + '" style="width: 166px; height: 166px;" \
    onerror="this.src=\'http://admin.ewaiter.info/images/noPic.gif\'" />';
    obj.data.items[i].data['path'] = temp;
  }
  if ( Ext.isElement('panel_menu_table-body') == false )
  {
    Ext.getCmp('frame_center').setActiveTab(0);
  }
  Ext.getCmp('menu_table').reconfigure( Ext.getStore('menuStore') );
}*/

/*function change_menuType()
{
  Ext.getCmp('menutype_lookup').select( Ext.getStore('menutypeStore').data.items[0].data.id );
  Ext.getCmp('menutype_lookup').on('select',function(){
    Ext.getStore('menuStore').proxy.extraParams = {'menuType': Ext.getCmp('menutype_lookup').lastValue};
    Ext.getStore('menuStore').load();
  });
}*/

var menuOperation = new menu_operation();