package org.vaadin.se.views.hellothingy;

import com.vaadin.flow.component.DetachEvent;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouteAlias;
import org.vaadin.se.thingy52.Thingy52;

@PageTitle("Hello Thingy")
@Route(value = "thingy52")
@RouteAlias(value = "")
public class HelloThingyView extends VerticalLayout {

    private final TextField batteryLevel, temp, buttonState, x, y, z;
    private HorizontalLayout status, ledPanel, soundPanel;
    private Button scanAndConnect;
    private Button setLed,breatheLed,flashLed, setLedOff;
    private Button beep, beepRandon;
    private Thingy52 thingy;

    public HelloThingyView() {
        status = new HorizontalLayout();
        ledPanel = new HorizontalLayout();
        soundPanel = new HorizontalLayout();

        thingy = new Thingy52();
        scanAndConnect = new Button("Scan and connect", e -> {
            thingy.scan();
        });
        
        batteryLevel = new TextField("Battery");
        batteryLevel.setReadOnly(true);
        status.add(batteryLevel);

        temp = new TextField("Temp");
        temp.setReadOnly(true);
        status.add(temp);

        buttonState = new TextField("Button state");
        buttonState.setReadOnly(true);
        status.add(buttonState);

        x = new TextField("X");
        x.setReadOnly(true);
        status.add(x);

        y = new TextField("Y");
        y.setReadOnly(true);
        status.add(y);

        z = new TextField("Z");
        z.setReadOnly(true);
        status.add(z);


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

        add(scanAndConnect, status, ledPanel, soundPanel);

        // Event listeners
        thingy.addBatteryChangeListener(e -> { batteryLevel.setValue(""+e.getBatteryLevel());});
        thingy.addButtonListener(e -> { buttonState.setValue(""+e.isButtonPressed());});
        thingy.addTemperatureListener(e -> { temp.setValue(""+e.getTemperature());});
        thingy.addAccelerometerListener(e -> {
            double[] xyz = e.getXYZ();
            x.setValue(""+xyz[0]);
            y.setValue(""+xyz[1]);
            z.setValue(""+xyz[2]);
        });
    }

    @Override
    protected void onDetach(DetachEvent detachEvent) {
        thingy.disconnect();
    }

}
