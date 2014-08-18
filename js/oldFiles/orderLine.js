function change_totalCoast()
{
  var temStore = Ext.getStore('orderLineStore');
  var tempCoast = 0;
  for (var i = 0; i < temStore.data.items.length; ++i)
  {
    tempCoast += temStore.data.items[i].data['price'];
  }
  Ext.getCmp('totalCoast').setValue(tempCoast);
}
Ext.onReady(function()
{
  Ext.create('Ext.data.Store', {
    storeId:'orderLineStore',
    fields:['removability', 'editability','dish_name','dish_amount','price'],
    proxy: 
    {
      type: 'ajax',
      url: '../outputs/outputOrderLines.php',
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
        change_totalCoast();
      }
    },
    autoLoad: false
  });

  Ext.create('Ext.grid.Panel', {
    id: 'orderLineTable',
    scroll: 'vertical',
    store: Ext.data.StoreManager.lookup('orderLineStore'),
    margin: 10,
    title: 'Строки заказа',
    collapsible: true,
    animCollapse: false,
    flex: 2,
    columns: [
      { dataIndex: 'editability', width: 32},
      { dataIndex: 'removability', width: 32},
      { text: 'Название',  dataIndex: 'dish_name', flex: 1},
      { text: 'Количество', dataIndex: 'dish_amount', width: 200, align: 'center'},
      { text: 'Стоимость', dataIndex: 'price', width: 200, align: 'center'}
    ],
    dockedItems:[
    {
      xtype: 'toolbar',
      dock: 'bottom',
      items: [
      {
        xtype: 'button',
        text: 'Добавить',
        handler:function()
        {
          add_orderList();
        }
      },
      { xtype: 'tbfill' },
      {
        xtype: 'displayfield',
        fieldLabel: 'Итого',
        id: 'totalCoast',
        width: 140,
        value: '0'
      }]
    }]
  });

  var temp = ( Ext.getCmp('frame_center').getHeight() - 140 )/2;

  Ext.getCmp('frame_center').add(Ext.getCmp('panel_orders_table'));
  Ext.getCmp('panel_orders_table').add(Ext.getCmp('orders_filter'));
  Ext.getCmp('panel_orders_table').add(Ext.getCmp('orders_table'));
  Ext.getCmp('panel_orders_table').add(Ext.getCmp('orderLineTable'));
});

function add_componentMenu()
{
  if ( Ext.getCmp('panel_menu_table') == undefined )
  {
    create_menuTable();
    create_munuType_lookup();
  }
  Ext.getCmp('panel_menu_table').add( Ext.getCmp('menu_table') );
  Ext.getCmp('panel_menu_table').insert( 0,Ext.getCmp('menutype_lookup') );
  mod_menuStore();
}

function mod_menuStore()
{
  var temp = Ext.getStore('menuStore').data.items.length;
  for ( i = 0; i < temp; ++i )
  {
    Ext.getStore('menuStore').data.items[i].data.checked = false;
    Ext.getStore('menuStore').data.items[i].data.amount = 0;
  }
  Ext.getCmp('menu_table').reconfigure( Ext.getStore('menuStore') );
}

function add_orderList()
{
  add_componentMenu();
  if ( Ext.getCmp('orders_table').selModel.selected.items.length > 0 && Ext.getStore('orderLineStore').data.items.length > 0 )
  {
    Ext.create('Ext.window.Window', {
      title: 'Добавление блюд к заказу',
      height: Ext.select('html').elements[0].offsetHeight,
      width: Ext.select('html').elements[0].offsetWidth,
      layout: 'fit',
      modal: true,
      id: 'edit_window',
      items: Ext.getCmp('panel_menu_table'),
      bodyStyle: {background: '#ffffff'}
    }).show();
  }
}

function create_menuTable()
{
  Ext.create('Ext.data.Store', {
    storeId:'menuStore',
    fields:['removability', 'editability', 'checked', 'amount', 'name', 'shortDescription', 'Description', 'price', 'article', 'energyValuePortion', 'energyValue100'],
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
        mod_menuStore();
      }
    },
    autoLoad: true,
    autoSync: false
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
      { dataIndex: 'checked', width: 32, xtype : 'checkcolumn'},
      { text: 'Количество', width: 90, dataIndex: 'amount', editor: 'numberfield', align: 'center'},
      { text: 'Название',  dataIndex: 'name', flex: 1},
      { text: 'Краткое описание', dataIndex: 'shortDescription', flex: 2 },
      { text: 'Полное описание', dataIndex: 'Description', flex: 2 },
      { text: 'Эн. ценность порции', dataIndex: 'energyValuePortion', width: 160,align: 'center'},
      { text: 'Эн. ценность 100гр.', dataIndex: 'energyValue100', width: 160,align: 'center'},
      { text: 'Стоимость', dataIndex: 'price', width: 100,align: 'center'}
    ],
    selType: 'cellmodel',
    plugins: [
      Ext.create('Ext.grid.plugin.CellEditing', {
      clicksToEdit: 1
      })
    ],
    dockedItems:[
    {
      xtype: 'toolbar',
      dock: 'bottom',
      items: [
      {
        xtype: 'button',
        text: 'Добавить',
        handler:function()
        {
          collection_data();
        }
      }]
    }]
  });
}

function send_additional_data(data)
{
  Ext.Ajax.request({
    url: '../includes/update_orderList.php',
    params: 'data=' + data,
    success: function(response)
    {
      Ext.getStore('orderLineStore').load();
      Ext.getCmp('edit_window').close();
    }
  });
}

function collection_data()
{
  var temp = Ext.getStore('menuStore').data.items;
  var temp_array = new Array();
  temp_array.push({'id_order':Ext.getCmp('orders_table').selModel.selected.items[0].data.orders_id});
  for ( i = 0; i < temp.length; ++i )
  {
    if ( temp[i].data['checked'] == true && temp[i].data['amount'] > 0 )
    {
      temp_array.push({'id_menu':temp[i].data['article'],'amount':temp[i].data['amount']});
    }
  }

  if ( temp_array.length > 1 )
  {
    send_additional_data( Ext.JSON.encode( temp_array ) );
  }
}

function delete_orderLine(id)
{
  test = Ext.Msg.show({
    title:'Удаление блюда из заказ',
    msg: 'Данное действие приведет к удалению блюда из заказа, Вы действительно хотите произвести удаление ?',
    buttons: Ext.Msg.YESNO,
    fn: function(btn)
    {
      if ( btn == 'yes' )
      {
        Ext.Ajax.request({
          url: '../includes/delete_orderLine.php',
          params: 'id=' + id,
          success: function(response)
          {
            Ext.getStore('orderLineStore').load();
          }
        });
      }
    },
    icon: Ext.Msg.ERROR
  });
}