function insert_menuType(data)
{
  data.push( {"id_restorant":owner_object.restorant['id_restorant']} );

  Ext.Ajax.request({
    url: '../includes/insert_menuType.php',
    params: 'data=' + Ext.JSON.encode(data),
    success: function(response)
    {
      Ext.getStore('menutypeStore').load();
    }
  });
}

function delete_menuType()
{
  Ext.Msg.show({
    title:'Удаление типа меню',
    msg: 'Вы действительно хотите произвести удаление ?',
    buttons: Ext.Msg.YESNO,
    fn: function(btn)
    {
      if ( btn == 'yes' )
      {
      if ( Ext.getCmp('menuType_table').selModel.selected.items[0] != undefined )
      {
        //console.log( Ext.getCmp('menuType_table').selModel.selected.items[0].data.id );
        Ext.Ajax.request({
          url: '../../includes/delete_menuType.php',
          params: 'id=' + Ext.getCmp('menuType_table').selModel.selected.items[0].data.id,
          success: function(response)
          {
            Ext.getStore('menutypeStore').load();
          }
        });}
      }
    },
    icon: Ext.Msg.INFO
  });
}

Ext.onReady(function()
{
  Ext.create('Ext.Panel', {
    title: 'Разделы Меню',
    id: 'panel_edit_menuType'
  });

  Ext.create('Ext.grid.Panel', {
    id: 'menuType_table',
    //plugins: [Editing],
    store: Ext.data.StoreManager.lookup('menutypeStore'),
    columns: [
      { dataIndex: 'editability', width: 32},
      { dataIndex: 'removability', width: 32},
      { text: 'Название раздела',  dataIndex: 'menuType', flex: 1},
      { text: 'Тип раздела',  dataIndex: 'common', flex: 1}
    ],
    dockedItems: 
    [
      {
        xtype: 'toolbar',
        store: Ext.data.StoreManager.lookup('menutypeStore'),
        dock: 'bottom',
        displayInfo: true,
        items:
        [
          {
            xtype: 'button',text:'Создать',
            handler:function()
            {
              edit_menuType('new');
            }
          }
        ]
       }
    ]
  });
});

function edit_menuType(state,table)
{
  var edit_form = Ext.create('Ext.form.Panel',{
    width: 400,
    height: 200,
    layout: 'anchor',
    margin: 10,
    border: 0,
    id: 'edit_form_menuType',
    items:[
    {
      xtype: 'textfield',
      fieldLabel: 'Название раздела',
      name: 'menuType',
      id: 'menuType',
      width: 350
    },
    {
      xtype: 'combo',
      editable: false,
      fieldLabel: 'Тип меню',
      store: {
        fields: ['id', 'name'],
        data : [
          {"id":"1", "name":"Общее"},
          {"id":"0", "name":"индивидуальное"}
        ]
      },
      queryMode: 'local',
      displayField: 'name',
      valueField: 'id',
      id: 'common'
    },
    {
      xtype: 'textfield',
      fieldLabel: 'ID ресторана',
      name: 'id_restaurant',
      id: 'id_restaurant',
      hidden: true,
      value: owner_object.restorant['id_restorant']
    },
    {
      xtype: 'textfield',
      fieldLabel: 'ID',
      name: 'id',
      id: 'id',
      hidden: true,
      value: 'new'
    }],
    buttons:[
    {
      text: 'Оправить',
      handler: function()
      {
        Ext.getCmp('edit_form_menuType').submit({
          url: '../includes/insert_menuType.php',
          success: function(form, action)
          {
            Ext.MessageBox.alert('Изменение пункта меню','Данные успешно внесены');
            Ext.getStore('menutypeStore').load();
            Ext.getCmp('edit_window').close();
          },
          failure: function(form, action)
          { 
            Ext.MessageBox.alert('Изменение пункта меню',action.result.message);
          }
        });
      }
    },
    {
      text: 'Отмена',
      handler: function()
      {
        Ext.getCmp('edit_window').close();
      }
    }]
  });

  Ext.create('Ext.window.Window', {
    title: 'Редактирование',
    height: 200,
    width: 400,
    layout: 'fit',
    modal: true,
    id: 'edit_window',
    items: edit_form,
    bodyStyle: {background: '#ffffff'}
  }).show();

  get_menu_data(state,table);
}

function send_delet_menuType(id)
{
  Ext.Ajax.request({
    url: '../includes/delete_menuType.php',
    params: 'id=' + id,
    success: function(response)
    {
      Ext.getStore('menutypeStore').load();
    }
  });
}

function delet_menuType(id)
{
  test = Ext.Msg.show({
    title:'Удаление раздела меню',
    id: 'dfgh',
    msg: 'Данное действие приведет к удалению раздела меню, Вы действительно хотите произвести удаление ?',
    buttons: Ext.Msg.YESNO,
    fn: function(btn)
    {
      if ( btn == 'yes' )
      {
        send_delet_menuType(id);
      }
    },
    icon: Ext.Msg.ERROR
  });
}