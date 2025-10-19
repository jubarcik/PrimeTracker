/*
 * Copyright 2016 - 2022 Anton Tananaev
 * Modificado por Prime Tracker (2025)
 *
 * Este código foi adaptado para iniciar automaticamente
 * no domínio fixo da Prime Tracker, sem tela inicial ou botão Start.
 */

@file:Suppress("DEPRECATION")
package org.primetracker.manager

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.webkit.WebViewFragment
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import androidx.preference.PreferenceManager

class MainActivity : AppCompatActivity() {

    var pendingEventId: Long? = null

    private fun updateEventId(intent: Intent?) {
        intent?.getStringExtra("eventId")?.let { pendingEventId = it.toLongOrNull() }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        updateEventId(intent)

        // 🚀 Inicia automaticamente o app
        if (savedInstanceState == null) {
            initContent()
        }
    }

    /**
     * Inicializa o conteúdo principal do app
     * Pulando o StartFragment e abrindo o MainFragment direto
     */
    private fun initContent() {
        // 🛰️ Define o servidor fixo da Prime Tracker
        val serverUrl = getString(R.string.server_url)
        // Salva a URL no SharedPreferences (compatível com Traccar Manager)
        val preferences = PreferenceManager.getDefaultSharedPreferences(this)
        preferences.edit()
            .putString("url",serverUrl)
            .apply()

        // 🔄 Abre diretamente o MainFragment (sem StartFragment)
        fragmentManager.beginTransaction()
            .replace(android.R.id.content, MainFragment())
            .commit()
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        updateEventId(intent)
        LocalBroadcastManager.getInstance(this)
            .sendBroadcast(Intent(MainFragment.EVENT_EVENT))
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ) {
        val fragment = fragmentManager.findFragmentById(android.R.id.content)
        fragment?.onRequestPermissionsResult(requestCode, permissions, grantResults)
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    }

    override fun onBackPressed() {
        val fragment = fragmentManager.findFragmentById(android.R.id.content) as? WebViewFragment
        if (fragment?.webView?.canGoBack() == true) {
            fragment.webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    companion object {
        const val PREFERENCE_URL = "url"
    }
}
