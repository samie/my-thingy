package org.vaadin.se.views.hellothingy;

import com.vaadin.flow.component.DetachEvent;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouteAlias;
import org.vaadin.se.Thingy52;
import org.vaadin.se.views.MainLayout;

@PageTitle("Hello Thingy")
@Route(value = "hello", layout = MainLayout.class)
@RouteAlias(value = "", layout = MainLayout.class)
public class HelloThingyView extends HorizontalLayout {

    private Button scanAndConnect, setLed, setLedOff;
    private Thingy52 thingy;

    public HelloThingyView() {
        thingy = new Thingy52();
        scanAndConnect = new Button("Scan and connect");
        scanAndConnect.addClickListener(e -> {
            thingy.scan();
        });
        setLed = new Button("Light up!");
        setLed.addClickListener(e -> {
            thingy.setLed(
                    (int) (255*Math.random()),
                    (int) (255*Math.random()),
                    (int) (255*Math.random()));
        });
        setLedOff = new Button("Led Off");
        setLedOff.addClickListener(e -> {
            thingy.setLedOff();
        });
        setMargin(true);
        add(scanAndConnect, setLed, setLedOff);
    }

    @Override
    protected void onDetach(DetachEvent detachEvent) {
        thingy.disconnect();
    }
}
