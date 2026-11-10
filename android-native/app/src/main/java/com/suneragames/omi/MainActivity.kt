package com.suneragames.omi

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.suneragames.omi.ui.FeltDark
import com.suneragames.omi.ui.GameViewModel
import com.suneragames.omi.ui.HomeScreen
import com.suneragames.omi.ui.MatchScreen
import com.suneragames.omi.ui.Screen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { OmiApp() }
    }
}

@Composable
fun OmiApp() {
    val vm: GameViewModel = viewModel()
    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = FeltDark) {
            when (vm.screen) {
                Screen.HOME -> HomeScreen(vm)
                Screen.MATCH -> MatchScreen(vm)
            }
        }
    }
}
