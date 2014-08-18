Ext.onReady(function()
{
  Ext.create('Ext.Panel', {
    title: 'Загрузка excel',
    id: 'panel_excel',
    overflowY: 'auto'
  });

  Ext.create('Ext.form.Panel',{
    width: 400,
    height: 80,
    layout: 'anchor',
    margin: 10,
    border: 0,
    buttonAlign: 'left',
    id: 'form_menuExcel',
    items:[
    {
      xtype: 'filefield',
      fieldLabel: 'Файл excel (.xls)',
      name: 'excelFile',
      id: 'excelFile',
      width: 350
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
      name: 'noAuto',
      id: 'noAuto',
      hidden: true,
      value: '0'
    }],
    buttons:[
    {
      text: 'Оправить',
      handler: function()
      {
        Ext.getCmp('form_menuExcel').submit({
          url: '../../includes/insertMenuExcel.php',
          success: function(form, action)
          {
            Ext.MessageBox.alert('Добавление данных','Данные из файла успешно загружены');
            Ext.getStore('menutypeStore').load();
            Ext.getStore('menuStore').load();
          },
          failure: function(form, action)
          { 
            Ext.MessageBox.alert('Добавление данных','Ошибка загрузки данных из файла');
          }
        });
      }
    },
    {
      text: 'Отмена',
      handler: function()
      {
        //
      }
    }]
  });
});