const projectViewMenu = {
    id: 'TEST-MENU',
    data: [
        {
            text: 'Add',
            action: function (e, selector) {
                e.preventDefault();
                alert('Create clicked on ' + selector.prop("tagName") + ":" + selector.attr("id"));
            }
        }
    ]
};

export default class ProjectViewContextMenuManager {
    init(projectViewId) {
        // TODO: timeout is incorrect, now for test
        setTimeout(() => {
            console.log("attach project view context menu")
            context.attach(projectViewId, projectViewMenu)
        }, 1000)
    }
}