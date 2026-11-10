package com.suneragames.omi

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { OmiApp() }
    }
}

private val Felt = Color(0xFF0B2E27)
private val Gold = Color(0xFFF3DC82)
private val Paper = Color(0xFFD7E2D9)

@Composable
fun OmiApp() {
    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = Felt) {
            Column(
                modifier = Modifier.fillMaxSize().padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Text("OMI", color = Gold, fontSize = 56.sp, fontWeight = FontWeight.Bold)
                Text("Sri Lanka's partnership card game", color = Paper, fontSize = 15.sp)
                Spacer(Modifier.height(28.dp))
                Button(
                    onClick = { /* Match flow lands in the next milestone. */ },
                    colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Color(0xFF1B2A24)),
                ) {
                    Text("Play match", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
