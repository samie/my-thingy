package org.vaadin.se;

import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.dependency.JsModule;

@JsModule("./thingy52.js")
@JsModule("./globalThingy.js")
public class Thingy52 {


    /* Supported led modes.
          0 = off, 1 = on, 2 = breathe, 3 = one shot
        */
    public enum LedMode {
        OFF(0), 
        ON(1),
        BREATHE(2),
        ONE_SHOT(3);

        private final int value;

        LedMode(int mode) {
            this.value = mode;
        }
    }


    public void scan() {
        UI.getCurrent().getPage().executeJs("Thingy.scan()");
    }

    public void disconnect() {
        UI.getCurrent().getPage().executeJs("Thingy.disconnect()");
    }

    public void setLed(int r, int g, int b) {
        UI.getCurrent().getPage().executeJs("Thingy.setLED($0,$1,$2)",  r, g, b);
    }

    public void setLedOff() {
        UI.getCurrent().getPage().executeJs("Thingy.setLEDOff()");
    }


}
