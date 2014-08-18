Ext.onReady(function()
{
  create_menuTable();
});

function create_menuTable()
{
  Ext.create('Ext.data.Store', {
    storeId:'menuStore',
    fields:['removability', 'editability', 'name', 'shortDescription', 'path', 'Description', 'price', 'article', 'energyValuePortion', 'energyValue100'],
    proxy: 
    {
      type: 'ajax',
      url: '../outputs/outputMenu.php?bssid=' + owner_object.restorant['bssid'],
      reader: 
      {
        type: 'json',
        totalProperty: 'totalCount'
      }
    },
    listeners:
    {
      load: function()
      {
        mod_src(this);
      }
    },
    autoLoad: true,
    autoSync: true
  });

  Ext.create('Ext.Panel', {
    title: 'Меню ресторана',
    id: 'panel_menu_table',
    layout:
    {
      type: 'vbox',
      align: 'stretch'
    }
  });

  Ext.create('Ext.grid.Panel', {
    id: 'menu_table',
    scroll: 'vertical',
    flex: 3,
    store: Ext.data.StoreManager.lookup('menuStore'),
    columns: [
      { dataIndex: 'editability', width: 32},
      { dataIndex: 'removability', width: 32},
      { text: 'Название',  dataIndex: 'name', flex: 1},
      { text: 'Изображение', dataIndex: 'path', width: 200},
      { text: 'Краткое описание', dataIndex: 'shortDescription', flex: 2 },
      { text: 'Полное описание', dataIndex: 'Description', flex: 2 },
      { text: 'Эн. ценность порции', dataIndex: 'energyValuePortion', width: 160,align: 'center'},
      { text: 'Эн. ценность 100гр.', dataIndex: 'energyValue100', width: 160,align: 'center'},
      { text: 'Стоимость', dataIndex: 'price', width: 100,align: 'center'}
    ],
    dockedItems:[
    {
      xtype: 'toolbar',
      dock: 'bottom',
      items: [
      {
        xtype: 'button',
        text: 'Создать',
        handler:function()
        {
          edit_menu('new');
        }
      }]
    }]
  });
}

function mod_src(obj)
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
}