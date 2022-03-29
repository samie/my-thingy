package org.vaadin.se;

import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.dependency.JsModule;

@JsModule("./thingy52.js")
@JsModule("./globalThingy.js")
public class Thingy52 {

    public void scan() {
        UI.getCurrent().getPage().executeJs("Thingy.scan()");
    }

    public void disconnect() {
        UI.getCurrent().getPage().executeJs("Thingy.discussion()");
    }

    public void setLED(int r, int g, int b) {
        UI.getCurrent().getPage().executeJs("Thingy.setLED($0,$1,$2)", r, g, b);
    }

}
