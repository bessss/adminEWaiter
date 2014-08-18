function menu()
{
  this.menuTable = new Object();
  this.menuStore = new Object();
  this.menuPanel = new Object();
  this.lookup = new menuTypeLookup(this);
  this.menuTypeObject = new menuType(this);
  this.menuExcelObject = new menuExcelImport(this);
  this.menuExcelExport = new menuExcelExport(this);
  this.menuOperation = new menuOperation(this);

  this.menuTable_Create = menuTable_Create;
  this.menuComponent_Add = menuComponent_Add;
  this.menuStore_Change = menuStore_Change;
  this.data_Change = data_Change;

  this.menuTable_Create();
  this.menuComponent_Add();
}

function menuComponent_Add()
{
  Ext.getCmp('frame_center').insert( 0,Ext.getCmp('menuPanel') );
  Ext.getCmp('frame_center').add(Ext.getCmp('menuTypePanel'));
  Ext.getCmp('frame_center').add(Ext.getCmp('menuExcelPanel_Export'));
  Ext.getCmp('frame_center').add(Ext.getCmp('menuExcelPanel'));
}

function data_Change(state,table)
{
  if ( state != 'new' )
  {
    var temp_data = Ext.getCmp(table).selModel.selected.items[0].data;
    for (var i in temp_data)
    {
      if ( Ext.getCmp(i) != undefined )
      {
        switch ( Ext.getCmp(i).xtype )
        {
          case 'textfield':
          {
            Ext.getCmp(i).setValue( temp_data[i] );
            break;
          }
          case 'combo':
          {
            var temp = Ext.getCmp(i).store.data.items;
            for ( z = 0; z < temp.length; ++z )
            {
              if ( temp[z].data['name'] == temp_data[i] )
              {
                Ext.getCmp(i).select(temp[z].data['id']);
              }
            }
            break;
          }
          case 'displayfield':
          {
            Ext.getCmp(i).setValue( temp_data[i] );
            break;
          }
          case 'textareafield':
          {
            Ext.getCmp(i).setValue( temp_data[i] );
            break;
          }
        }
      }
    }
  }
}

function menuStore_Change(obj)
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
  Ext.getCmp('menuTable').reconfigure( Ext.getStore('menuStore') );
}

function menuTable_Create()
{
  var self = this;
  this.menuStore = Ext.create('Ext.data.Store', {
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
        self.menuStore_Change(this);
      }
    },
    autoLoad: true,
    autoSync: true
  });

  this.menuPanel = Ext.create('Ext.Panel', {
    title: 'Меню ресторана',
    id: 'menuPanel',
    layout:
    {
      type: 'vbox',
      align: 'stretch'
    }
  });

  this.menuTable = Ext.create('Ext.grid.Panel', {
    id: 'menuTable',
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
          self.menuOperation.menu_Edit('new');
        }
      }]
    }]
  });

  Ext.getCmp('menuPanel').add( Ext.getCmp('menuTable') );
  Ext.getCmp('menuPanel').insert( 0,Ext.getCmp('menuTypeLookup') );
}

Ext.onReady(function()
{
  menuObject = new menu();
});

var menuObject = new Object();