describe("background testing", function() {

  it("calls on updated add listener", function() {
    expect( chrome.tabs.onUpdated.addListener ).toHaveBeenCalled();
  });

  it("adds a tab on creation", function() {
    var tab = {
      url: 'http://google.com',
      id: 1
    };

    addTab( tab );

    expect( tabList.length ).toEqual( 1 ); 
  });
});
