package org.vaadin.se.views.hellothingy;

import com.vaadin.flow.component.DetachEvent;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouteAlias;
import org.apache.commons.lang3.ArrayUtils;
import org.vaadin.se.Thingy52;
import org.vaadin.se.views.MainLayout;

@PageTitle("Hello Thingy")
@Route(value = "hello", layout = MainLayout.class)
@RouteAlias(value = "", layout = MainLayout.class)
public class HelloThingyView extends VerticalLayout {

    private HorizontalLayout ledPanel, soundPanel;
    private Button scanAndConnect;
    private Button setLed,breatheLed,flashLed, setLedOff;
    private Button beep, beepRandon;
    private Thingy52 thingy;

    public HelloThingyView() {
        ledPanel = new HorizontalLayout();
        soundPanel = new HorizontalLayout();

        thingy = new Thingy52();
        scanAndConnect = new Button("Scan and connect", e -> {
            thingy.scan();
        });
        setLed = new Button("Light up!", e -> {
            thingy.setLed(
                    (int) (255*Math.random()),
                    (int) (255*Math.random()),
                    (int) (255*Math.random()));
        });
        breatheLed = new Button("Breathe!", e -> {
            thingy.setLedBreathe(
                    Thingy52.Color.randomColor(),
                    100,
                    1000);
        });
        flashLed = new Button("Flash!", e -> {
            thingy.setLedFlashOnce(
                    Thingy52.Color.randomColor(),
                    100);
        });
        setLedOff = new Button("Led Off", e -> {
            thingy.setLedOff();
        });
        setMargin(true);
        ledPanel.add(setLed, breatheLed, flashLed, setLedOff);

        // Sound
        beep = new Button("Beep", e -> {
            thingy.beep();
        });
        soundPanel.add(beep);

        beepRandon = new Button("Beep random", e -> {
            thingy.beep(
                    500+(int) (10000*Math.random()),
                    100+(int) (1900*Math.random()),
                    10+(int) (80*Math.random())
            );
        });
        soundPanel.add(beep,beepRandon);

        add(scanAndConnect, ledPanel, soundPanel);
    }

    @Override
    protected void onDetach(DetachEvent detachEvent) {
        thingy.disconnect();
    }

}
