#include <stdlib.h>
#include "pxt.h"

using namespace std;

namespace joyfrog {

    //%
    void setSerialBuffer(int size) {
        uBit.serial.setRxBufferSize(size);
        uBit.serial.setTxBufferSize(size);
    }
    
    
    
} // namespace joyfrog
