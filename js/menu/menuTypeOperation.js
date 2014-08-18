function menuTypeOperation(owner)
{
  this.menuTypeEditForm = new Object();
  this.editWindow = new Object();
  this.owner = owner;

  this.menuType_Edit = menuType_Edit;
  this.menuType_Delete = menuType_Delete;
}

function menuType_Delete(id)
{
  Ext.Msg.show({
    title:'Удаление раздела меню',
    msg: 'Данное действие приведет к удалению раздела меню, Вы действительно хотите произвести удаление ?',
    buttons: Ext.Msg.YESNO,
    fn: function(btn)
    {
      if ( btn == 'yes' )
      {
        Ext.Ajax.request({
          url: '../includes/delete_menuType.php',
          params: 'id=' + id,
          success: function(response)
          {
            Ext.getStore('menuTypeStore').load();
          }
        });
      }
    },
    icon: Ext.Msg.ERROR
  });
}

function menuType_Edit(state,table)
{
  var self = this;
  this.menuTypeEditForm = Ext.create('Ext.form.Panel',{
    width: 400,
    height: 200,
    layout: 'anchor',
    margin: 10,
    border: 0,
    id: 'menuTypeEditForm',
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
        Ext.getCmp('menuTypeEditForm').submit({
          url: '../includes/insert_menuType.php',
          success: function(form, action)
          {
            Ext.MessageBox.alert('Изменение пункта меню','Данные успешно внесены');
            Ext.getStore('menuTypeStore').load();
            Ext.getCmp('editWindow').close();
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
        Ext.getCmp('editWindow').close();
      }
    }]
  });

  this.editWindow = Ext.create('Ext.window.Window', {
    title: 'Редактирование',
    height: 150,
    width: 400,
    layout: 'fit',
    modal: true,
    id: 'editWindow',
    items: self.menuTypeEditForm,
    bodyStyle: {background: '#ffffff'}
  }).show();

  this.owner.owner.data_Change(state,table);
}